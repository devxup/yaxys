const config = require("config")

module.exports = {
  constants: {
    timezone: config.get("timezone"),
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
  },
}
