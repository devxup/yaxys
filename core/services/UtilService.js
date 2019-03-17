const config = require("config")

module.exports = {
  constants: {
    timezone: config.get("timezone"),
    paginationLimit: config.get("paginationLimit"),
    language: config.get("lng"),
  },

  /**
   * Perform the rest of initialization:
   * - Build Utils.constants containing all model schemas and other constants for the client-side
   */
  init() {
    const schemas = _.reduce(
      yaxys.models,
      (memo, model, key) => {
        if (model.schema) {
          memo[key] = model.schema
        }
        return memo
      },
      {}
    )
    module.exports.constants.languages = yaxys.languages
    const localizedSchemas = {}
    for (let language in yaxys.schemaLocales) {
      localizedSchemas[language] = _.cloneDeep(schemas)
      for (let schemaKey in yaxys.schemaLocales[language]) {
        const realSchema = yaxys.models[schemaKey].schema
        const i18Key = realSchema.i18Key
        localizedSchemas[language][schemaKey].title =
          (i18Key && yaxys.locales[language][i18Key])
          || realSchema.title
        for (let property in yaxys.schemaLocales[language][schemaKey]) {
          localizedSchemas[language][schemaKey].properties[property].title
            = yaxys.schemaLocales[language][schemaKey][property]
        }
      }
    }
    module.exports.constants.schemas = schemas
    module.exports.localizedSchemas = localizedSchemas
  },
}
