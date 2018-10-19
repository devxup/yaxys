const knex = require("knex")
const _ = require("lodash")

const DEFAULT_OPTIONS = {
  limit: 100,
  select: "*",
}

const POSTGRES_TYPES = [
  "integer",
  "bigInteger",
  "text",
  "string",
  "float",
  "decimal",
  "boolean",
  "date",
  "dateTime",
  "time",
  "binary",
  "json",
  "jsonb",
  "uuid",
]

const SET_TRANSACTION_LEVEL = "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;"

module.exports = class Adapter {
  constructor(config, options) {
    this.knex = knex({
      client: "pg",
      connection: config,
    })
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    this.schemas = {}
  }

  /**
   * Init the adapter by performing simple async query.
   * Knex doesn't actually perform connections and other async operatons before the first query
   */
  async init() {
    await this.knex.raw("select now();")
  }

  /**
   * Start the transaction and return its context
   * @returns {Promise<Object>} The transaction context to use in further queries
   */
  async transaction() {
    return new Promise((resolve, reject) => {
      this.knex
        .transaction(trx => {
          trx.raw(SET_TRANSACTION_LEVEL).then(() => resolve(trx))
        })
        .catch(reject)
    })
  }

  /**
   * Commit the transaction
   * @param {Object} trx The transaction context created by await Adapter.transaction()
   */
  async transactionCommit(trx) {
    await trx.commit()
  }

  /**
   * Rollback the transaction
   * @param {Object} trx The transaction context created by await Adapter.transaction()
   */
  async transactionRollback(trx) {
    await trx.rollback()
  }

  /**
   * Sanitize the data using model's schema before updating or inserting
   * @param {String} identity The models' identity
   * @param {Object} data The data to sanitize
   * @returns {void}
   * @private
   */
  _sanitize(identity, data) {
    const schema = this.schemas[identity]
    if (!schema) {
      throw new Error(`schema ${identity} not found`)
    }
    if (!data) {
      throw new Error("data is required")
    }
    if (typeof data !== "object") {
      throw new Error("data expected to be an object")
    }
    if (Array.isArray(data)) {
      throw new Error("data should not be an array")
    }

    return _.mapValues(data, (value, key) => {
      const attribute = schema.properties[key]
      switch (attribute && attribute.type) {
        case "object":
          return typeof value === "string" ? value : JSON.stringify(value)
        case "number":
        case "integer":
          return typeof value === "string" ? Number(value) : value
      }
      return value
    })
  }

  /**
   * Register given schema into the schemas' registry
   * @param {String} identity The model's identity
   * @param {Object} schema The schema to register
   */
  registerSchema(identity, schema) {
    this.schemas[identity] = schema
  }

  /**
   * Insert new model into the table
   * @param {String} identity The model's identity
   * @param {Object} data The model blank to insert
   * @param {Object} [trx] The transaction context
   * @returns {Promise<Object>} The inserted model containing all of the fields, includeing id
   */
  async insert(identity, data, trx) {
    const dataToInsert = data.id ? data : _.omit(data, "id")

    const fixedData = this._sanitize(identity, dataToInsert)

    const insert = this.knex(identity)
      .insert(fixedData)
      .returning("*")
    const result = trx ? await insert.transacting(trx) : await insert
    return result[0]
  }

  /**
   * Update the model by it's id
   * @param {String} identity The model's identity
   * @param {String|Integer} id  Model's id
   * @param {Object} data new The patch for the model's instance
   * @param {Object} [trx] The transaction context
   * @returns {Promise<Object>} The inserted model containing all of the fields, includeing id
   */
  async update(identity, id, data, trx) {
    if (!id) {
      throw new Error("id is required")
    }
    const fixedData = this._sanitize(identity, data)

    const update = this.knex(identity)
      .where({ id })
      .update(fixedData)
      .returning("*")
    const result = trx ? await update.transacting(trx) : await update

    if (!result.length) {
      throw new Error(`Update failed – record with id ${id} not found`)
    }

    return result[0]
  }

  /**
   * Find the first model matching the filter
   * @param {String} identity The model's identity
   * @param {Object} filter The filter to match
   * @param {Object} [options] The options to find
   * @param {Object} [trx] The transaction context
   * @param {Array} [otmPopulate] Fields to be populated with 1:m relation
   * @param {Object[]} [mtmPopulate] Identities of models to be linked with m:m relation
   * @param {String} mtmPopulate[].linkerModel The linker model identity
   * @param {String} mtmPopulate[].initialModel The initial model identity
   * @param {String} mtmPopulate[].modelToLink The model to link identity
   * @returns {Promise<Object|undefined>} The model found or undefined
   */
  async findOne(identity, filter, options, trx, otmPopulate = [], mtmPopulate = []) {
    let result = (await this.find(identity, filter, Object.assign({ limit: 1 }, options), trx))[0]
    for (let field of otmPopulate) {
      await this._oneToModelPopulate([result], field)
    }
    for (let field of mtmPopulate) {
      await this._modelToModelPopulate([result], field.linkerModel, field.initialModel, field.modelToLink)
    }
    return result
  }

  /**
   * Find models matching the criteria
   * @param {String} identity The model's identity
   * @param {Object} filter The filter to match
   * @param {Object} [options] The options to find
   * @param {Object} [trx] The transaction context
   * @param {Array} [otmPopulate] Fields to be populated with 1:m relation
   * @param {Object[]} [mtmPopulate] Identities of models to be linked with m:m relation
   * @param {String} mtmPopulate[].linkerModel The linker model identity
   * @param {String} mtmPopulate[].initialModel The initial model identity
   * @param {String} mtmPopulate[].modelToLink The model to link identity
   * @returns {Promise<Array<Object>>} The array of found models
   */
  async find(identity, filter, options, trx, otmPopulate = [], mtmPopulate = []) {
    let query = this.knex(identity).where(filter)
    _.each(Object.assign({}, this.options, options), (value, key) => {
      switch (key) {
        case "limit":
        case "skip":
        case "select":
          query = query[key](value)
          break
        case "sort":
          _.each(value, (v, k) => {
            query = query.orderBy(k, Number(v) === -1 ? "desc" : "asc")
          })
          break
      }
    })

    let result = await (trx ? query.transacting(trx) : query)
    for (let field of otmPopulate) {
      await this._oneToModelPopulate(result, field)
    }
    for (let field of mtmPopulate) {
      await this._modelToModelPopulate(result, field.linkerModel, field.initialModel, field.modelToLink)
    }
    return result
  }

  /**
   * Populates the given models with 1:m relation
   * @param {Object[]} initialModelArr The array of models to be populated
   * @param {String} populatingModelIdentity The identity of related model
   * @private
   */
  async _oneToModelPopulate(initialModelArr, populatingModelIdentity) {
    let idsSet = new Set()
    for (let model of initialModelArr) {
      idsSet.add(model[populatingModelIdentity])
    }
    const idsArr = [...idsSet]

    const populatingModelsArr = await this.knex(populatingModelIdentity.toLowerCase()).whereIn("id", idsArr)
    for (let model of initialModelArr) {
      for (let populatingModel of populatingModelsArr) {
        if (model[populatingModelIdentity] === populatingModel.id) {
          model[populatingModelIdentity] = populatingModel
          break
        }
      }
    }
  }

  /**
   * Populates the given model with m:m relation
   * @param {Array} initialModelArr The array of models to be populated
   * @param {String} linkerModelIdentity The identity of linker model
   * @param {String} initialModelIdentity The identity of initial model
   * @param {String} modelToLinkIdentity The identity of model to be linked
   * @private
   */
  async _modelToModelPopulate(initialModelArr, linkerModelIdentity, initialModelIdentity, modelToLinkIdentity) {
    let initialModelIdsSet = new Set()
    for (let initialModel of initialModelArr) {
      initialModelIdsSet.add(initialModel.id)
      initialModel[modelToLinkIdentity] = []
    }
    const initialModelIdsArr = [...initialModelIdsSet]

    const linkerModelArr = await this
      .knex(linkerModelIdentity.toLowerCase())
      .whereIn(initialModelIdentity, initialModelIdsArr)
    let modelToLinkIdsSet = new Set()
    for (let linkerModel of linkerModelArr) {
      modelToLinkIdsSet.add(linkerModel[modelToLinkIdentity])
    }
    const modelToLinkIdsArr = [...modelToLinkIdsSet]

    const modelToLinkArr = await this.knex(modelToLinkIdentity.toLowerCase()).whereIn("id", modelToLinkIdsArr)
    for (let linkerModel of linkerModelArr) {
      for (let initialModel of initialModelArr) {
        if (initialModel.id === linkerModel[initialModelIdentity]) {
          for (let modelToLink of modelToLinkArr) {
            if (modelToLink.id === linkerModel[modelToLinkIdentity]) {
              initialModel[modelToLinkIdentity].push(modelToLink)
              break
            }
          }
          break
        }
      }
    }
  }

  /**
   * Create the knex promise which, when called then(), will create the table for given model
   * @param {String} identity The model's identity
   * @param {Object} schema The model's schema
   * @returns {{ then: Function }} The knex promise
   * @private
   */
  _newTable(identity, schema) {
    return this.knex.schema.createTable(identity, table => {
      table.increments("id").primary()
      _.forEach(schema.properties, (value, key) => {
        if (key === "id") return
        if (!POSTGRES_TYPES.concat("object", "array").includes(value.type)) {
          throw new Error(`Incorrect data type ${value.type} of field ${key} in ${identity}`)
        }
        let attribute;
        ["object", "array"].includes(value.type)
          ? attribute = table.json(key)
          : attribute = table[value.type](key)
        if (Array.isArray(schema.required) && schema.required.includes(key)) {
          attribute.notNullable()
        }
        if (value.unique) {
          table.unique(key)
        }
      })
    })
  }

  /**
   * Create the table for given model
   * @param {String} identity The model's identity
   * @param {Object} schema The model's schema
   */
  async createTable(identity, schema) {
    await this._newTable(identity, schema).then()
  }

  /**
   * Get the SQL for creating the table of the given model
   * @param {String} identity The model's identity
   * @param {Object} schema The model's schema
   * @returns {String} The SQL
   */
  getSQLForCreateTable(identity, schema) {
    return this._newTable(identity, schema).toString()
  }

  /**
   * Gracefully shutdown the adapter
   */
  async shutdown() {
    await this.knex.destroy()
  }
}
