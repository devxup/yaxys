const config = require("config")

module.exports = {
  constants: {
    timezone: config.get("timezone"),
    settings: config.get("settings"),
    language: config.get("lng"),
  },

  /**
   * Perform the rest of initialization:
   * - Build Utils.constants containing all model schemas and other constants for the client-side
   */
  init() {
    const settings = config.get("settings") || {}
    const schemas = _.reduce(
      yaxys.models,
      (memo, model, key) => {
        if (model.schema) {
           const schemaClone = _.cloneDeep(model.schema)
          _.each(model.schema.properties, (property, propertyKey) => {
            property.hidden = property.isHidden && property.isHidden(settings)
          })
          memo[key] = schemaClone
        }
        return memo
      },
      {}
    )
    if (settings.singleCredential) {
      _.merge(
        schemas.user.properties.credentialCode,
        schemas.credential.properties.code,
        {
          title: schemas.user.properties.credentialCode.title,
          hidden: false,
          virtual: true,
        },
      )
    }

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
