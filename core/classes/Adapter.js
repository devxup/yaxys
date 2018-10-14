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
   * @returns {Promise<Object|undefined>} The model found or undefined
   */
  async findOne(identity, filter, options, trx) {
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
  async find(identity, filter, options, trx) {
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

    return trx ? query.transacting(trx) : query
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
        if (!POSTGRES_TYPES.includes(value.type)) {
          throw new Error(`Incorrect data type ${value.type} of field ${key} in ${identity}`)
        }
        const attribute = table[value.type](key)
        if (Array.isArray(schema.required) && schema.required.includes(key)) {
          attribute.notNullable()
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
