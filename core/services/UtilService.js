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
    module.exports.constants.schemas = _.reduce(
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
  },
}
