/**
 * Get the SQL for creating table for specific model
 * @param {String} identity The identity of the model
 * @param {Object} jsonSchema The model's schema
 * @returns {String} The SQL
 * @private
 */
const _getSQLForSchema = function(identity, jsonSchema) {
  return yaxys.db.getSQLForCreateTable(identity, jsonSchema)
}

/**
 * Create the table for specific model
 * @param {String} identity The identity of the model
 * @param {Object} jsonSchema The model's schema
 * @private
 */
const _createTableForSchema = async function(identity, jsonSchema) {
  await yaxys.db.createTable(identity, jsonSchema)
}

module.exports = {

  /**
   * Get the SQL for creating tables for all the models
   * @returns {String} The SQL
   */
  getSQLForAllModels() {
    const modelsSQL = []
    for (let model in yaxys.models) {
      if (yaxys.models[model].schema) {
        modelsSQL.push(_getSQLForSchema(model, yaxys.models[model].schema))
      }
    }
    return modelsSQL.join(";\r\n")
  },

  /**
   * Create the tables for all the models
   */
  async createTablesForAllModels() {
    for (let model in yaxys.models) {
      if (yaxys.models[model].schema) {
        await _createTableForSchema(model, yaxys.models[model].schema)
      }
    }
  },

  /**
   * Patch the model instance by removing all the password fields from it
   * @param {Object} data model instance
   * @param {Object} schema model schema – to detect which fields are passwords
   */
  removePasswordProperties(data, schema) {
    _.each(schema.properties, (property, propertyKey) => {
      if (!property.password) {
        return
      }
      delete data[propertyKey]
    })
  },

  /**
   * Patch the model instance by encrypting all the password fields using AuthService.encryptPassword
   * @param {Object} data model instance
   * @param {Object} schema model schema – to detect which fields are passwords
   */
  encryptPasswordProperties(data, schema) {
    _.each(schema.properties, (property, propertyKey) => {
      if (!property.password) {
        return
      }
      if (!data[propertyKey]) {
        delete data[propertyKey]
        return
      }
      data[propertyKey] = AuthService.encryptPassword(data[propertyKey])
    })
  },

  /**
   * Remove read-only properties from model instance
   * @param {Object} data Model instance
   * @param {Object} schema Model schema
   */
  removeReadOnlyProperties(data, schema) {
    _.each(schema.properties, (property, propertyKey) => {
      if (property.readOnly && data.hasOwnProperty(propertyKey)) {
        delete data[propertyKey]
      }
    })
  },
}
