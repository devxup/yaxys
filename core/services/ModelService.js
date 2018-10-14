const _getSQLForSchema = function(identity, jsonSchema) {
  return yaxys.db.getSQLForCreateTable(identity, jsonSchema)
}

const _createTableForSchema = async function(identity, jsonSchema) {
  await yaxys.db.createTable(identity, jsonSchema)
}

module.exports = {
  getSQLForAllModels() {
    let result = ""
    for (let model in yaxys.models) {
      if (yaxys.models[model].schema) {
        result += _getSQLForSchema(model, yaxys.models[model].schema)
      }
    }
    return result
  },

  async createTablesForAllModels() {
    for (let model in yaxys.models) {
      if (yaxys.models[model].schema) {
        await _createTableForSchema(model, yaxys.models[model].schema)
      }
    }
  },

  removePasswordProperties(data, schema) {
    _.each(schema.properties, (property, propertyKey) => {
      if (!property.password) {
        return
      }
      delete data[propertyKey]
    })
  },

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
}
