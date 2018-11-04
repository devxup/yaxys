const knex = require("knex")
const _ = require("lodash")
const EventEmitter = require("promise-events")

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
    this.emitter = new EventEmitter()
  }

  /**
   * Init the adapter by performing simple async query.
   * Knex doesn't actually perform connections and other async operatons before the first query
   */
  async init() {
    await this.knex.raw("select now();")
  }

  /**
   * Register db listener
   * @param {String} event The event to listen
   * @param {Function} listener The listener
   */
  async on(event, listener) {
    await this.emitter.on(event, listener)
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
   * @returns {Object} The sanitized data
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
      const property = schema.properties[key]
      switch (property && property.type) {
        case "object":
          return typeof value === "string" ? value : JSON.stringify(value)
        case "number":
        case "integer":
          if (
            property.connection &&
            property.connection.type === "m:1" &&
            typeof value === "object" &&
            value
          ) {
            return value.id
          }
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
    this.schemas[identity.toLowerCase()] = schema
  }

  /**
   * Insert new model into the table
   * @param {String} identity The model's identity
   * @param {Object} data The model blank to insert
   * @param {Object} [options] The options to find
   * @param {Object} [trx] The transaction context
   * @returns {Promise<Object>} The inserted model containing all of the fields, includeing id
   */
  async insert(identity, data, options = {}, trx) {
    const dataToInsert = data.id ? data : _.omit(data, "id")

    const fixedData = this._sanitize(identity, dataToInsert)

    await this.emitter.emit(`${identity}:create:before`, trx, fixedData)

    const insert = this.knex(identity)
      .insert(fixedData)
      .returning("*")
    const result = trx ? await insert.transacting(trx) : await insert
    const item = result[0]

    await this.emitter.emit(`${identity}:create:after`, trx, result)

    if (options && options.populate) {
      const propertiesToPopulate = Array.isArray(options.populate)
        ? options.populate
        : [options.populate]

      for (let property of propertiesToPopulate) {
        await this._populate(identity, [item], property, trx)
      }
    }

    return item
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

    const old = await this.findOne(identity, { id }, {}, trx)
    await this.emitter.emit(`${identity}:update:before`, trx, old, fixedData)

    const update = this.knex(identity)
      .where({ id })
      .update(fixedData)
      .returning("*")
    const result = trx ? await update.transacting(trx) : await update

    if (!result.length) {
      throw new Error(`Update failed – record with id ${id} not found`)
    }

    const item = result[0]
    await this.emitter.emit(`${identity}:update:after`, trx, old, item)

    return item
  }

  /**
   * Delete the model by it's id
   * @param {String} identity The model's identity
   * @param {String|Integer} id  Model's id
   * @param {Object} [trx] The transaction context
   * @returns {Promise<Object>} The deleted model instance
   */
  async delete(identity, id, trx) {
    if (!id) {
      throw new Error("id is required")
    }

    const old = await this.findOne(identity, { id }, {}, trx)
    await this.emitter.emit(`${identity}:delete:before`, trx, old)

    const deleteQuery = this.knex(identity)
      .where({ id })
      .del()

    await (trx ? deleteQuery.transacting(trx) : deleteQuery)

    await this.emitter.emit(`${identity}:delete:after`, trx, old)

    return old
  }

  /**
   * Find the first model matching the filter
   * @param {String} identity The model's identity
   * @param {Object} filter The filter to match
   * @param {Object} [options] The options to find
   * @param {Object} [trx] The transaction context
   * @returns {Promise<Object|undefined>} The model found or undefined
   */
  async findOne(identity, filter, options = {}, trx) {
    return (await this.find(identity, filter, Object.assign({ limit: 1 }, options), trx))[0]
  }

  /**
   * Find models matching the criteria
   * @param {String} identity The model's identity
   * @param {Object} filter The filter to match
   * @param {Object} [options] The options to find
   * @param {Object} [trx] The transaction context
   * @returns {Promise<Array<Object>>} The array of found models
   */
  async find(identity, filter, options = {}, trx) {
    let query = this.knex(identity).where(filter)
    _.each(Object.assign({}, this.options, options), (value, key) => {
      switch (key) {
        case "limit":
        case "select":
          query = query[key](value)
          break
        case "offset":
        case "skip":
          query = query.offset(value)
          break
        case "sort":
          _.each(value, (v, k) => {
            query = query.orderBy(k, Number(v) === -1 ? "desc" : "asc")
          })
          break
      }
    })
    let result = await (trx ? query.transacting(trx) : query)
    if (options.populate) {
      const propertiesToPopulate = Array.isArray(options.populate)
        ? options.populate
        : [options.populate]

      for (let property of propertiesToPopulate) {
        await this._populate(identity, result, property, trx)
      }
    }
    return result
  }

  /**
   * Start query execution and return its promise.
   * Wrap query into existing transaction if needed
   * @param {Object} query The query
   * @param {Object} [trx] The transaction context
   * @returns {Promise<*>} The query result
   * @private
   */
  async _trxWrapper(query, trx) {
    return trx ? query.transacting(trx) : query
  }

  /**
   * Count the number of models of some identity
   * @param {String} identity The identity of model
   * @param {Object} filter The filter to match
   * @param {Object} [trx] The transaction context
   * @returns {Promise<number>} The number of models
   */
  async count(identity, filter, trx) {
    const rz = await this._trxWrapper(
      this.knex(identity)
        .where(filter)
        .count("*"),
      trx
    )
    return Number(rz[0].count)
  }

  /** Populates the given models with 1:m relation
   * @param {String} identity The initial model identity
   * @param {Object[]} models Models to be populated
   * @param {String} property The property to populate
   * @param {Object} [trx] The transaction context
   * @private
   */
  async _populate(identity, models, property, trx) {
    const schema = this.schemas[identity.toLowerCase()]
    const propertySchema = schema.properties[property]

    const connection = propertySchema.connection

    switch (connection.type) {
      case "m:m": {
        const linkerSchema = this.schemas[connection.linkerModel.toLowerCase()]
        const relatedIdentity =
          linkerSchema.properties[connection.linkerRelatedAttribute].connection.relatedModel

        const ids = [...new Set(models.map(model => model.id))]
        const linkerModels = await this._trxWrapper(
          this.knex(connection.linkerModel.toLowerCase())
            .whereIn(connection.linkerMyAttribute, ids)
            .orderBy("id", "asc"),
          trx
        )

        const relatedIds = [
          ...new Set(linkerModels.map(model => model[connection.linkerRelatedAttribute])),
        ]
        const relatedModels = await this._trxWrapper(
          this.knex(relatedIdentity.toLowerCase()).whereIn("id", relatedIds),
          trx
        )
        const relatedHash = relatedModels.reduce((hash, relatedItem) => {
          hash[relatedItem.id] = relatedItem
          return hash
        }, {})

        const relatedByMyIdHash = linkerModels.reduce((hash, linkerItem) => {
          const myId = linkerItem[connection.linkerMyAttribute]
          if (!hash[myId]) {
            hash[myId] = []
          }
          const relatedItem = {
            ...relatedHash[linkerItem[connection.linkerRelatedAttribute]],
            _binding_id: linkerItem.id,
          }
          hash[myId].push(relatedItem)
          return hash
        }, {})

        for (let model of models) {
          model[property] = relatedByMyIdHash[model.id] || []
        }

        break
      }
      case "m:1": {
        const ids = [...new Set(models.map(model => model[property]))]

        const relatedModels = await this._trxWrapper(
          this.knex(connection.relatedModel.toLowerCase()).whereIn("id", ids),
          trx
        )

        const relatedHash = relatedModels.reduce((hash, relatedItem) => {
          hash[relatedItem.id] = relatedItem
          return hash
        }, {})

        for (let model of models) {
          if (relatedHash[model[property]]) {
            model[property] = relatedHash[model[property]]
          }
        }
        break
      }
      case "1:m": {
        const ids = [...new Set(models.map(model => model.id))]

        const relatedModels = await this._trxWrapper(
          this.knex(connection.relatedModel.toLowerCase())
            .whereIn(connection.relatedModelAttribute, ids)
            .orderBy("id", "asc"),
          trx
        )

        const relatedByMyIdHash = relatedModels.reduce((hash, relatedItem) => {
          const myId = relatedItem[connection.relatedModelAttribute]
          if (!hash[myId]) {
            hash[myId] = []
          }
          hash[myId].push(relatedItem)
          return hash
        }, {})

        for (let model of models) {
          model[property] = relatedByMyIdHash[model.id] || []
        }
        break
      }
      default:
        throw new Error("Invalid connection type")
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
      _.forEach(schema.properties, (property, key) => {
        if (key === "id" || property.virtual) return

        const type = ["object", "array"].includes(property.type) ? "json" : property.type

        if (!POSTGRES_TYPES.includes(type)) {
          throw new Error(`Incorrect data type ${property.type} of field ${key} in ${identity}`)
        }
        const attribute = table[type](key)
        if (Array.isArray(schema.required) && schema.required.includes(key)) {
          attribute.notNullable()
        }
        if (property.hasOwnProperty("default")) {
          attribute.defaultTo(property.default)
        }
        if (property.unique) {
          table.unique(key)
        }
      })
      if (schema.uniqueKeys && typeof schema.uniqueKeys === "object") {
        _.forEach(schema.uniqueKeys, value => table.unique(value))
      }
    })
  }

  /**
   * Create the table for given model
   * @param {String} identity The model's identity
   * @param {Object} schema The model's schema
   */
  async createTable(identity, schema) {
    await this._newTable(identity, schema)//.then()
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
