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
      for (let schema in yaxys.schemaLocales[language]) {
        for (let property in yaxys.schemaLocales[language][schema]) {
          property === "schemaTitle"
            ? localizedSchemas[language][schema].title = yaxys.schemaLocales[language][schema][property]
            : localizedSchemas[language][schema].properties[property].title
              = yaxys.schemaLocales[language][schema][property]
        }
      }
    }
    module.exports.constants.schemas = schemas
    module.exports.localizedSchemas = localizedSchemas
  },
}
