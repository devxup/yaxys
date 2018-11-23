const config = require("config")

const CODE_FORMAT_PATTERNS = {
  hexadecimal: "^[0-9a-fA-F]+$",
  decimal: "^[0-9]+$",
}

const getCodePattern = (key = "decimal") => {
  const pattern = CODE_FORMAT_PATTERNS[key]
  if (!pattern) { throw new Error(`Unknown key for credential code pattern: ${key} `) }
  return pattern
}

module.exports = {
  schema: {
    title: "Credential",
    defaultProperties: ["id", "title", "user", "code"],
    properties: {
      id: {
        type: "integer",
      },
      title: {
        title: "Title",
        type: "string",
      },
      user: {
        title: "User",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "user",
        },
      },
      code: {
        title: "Code",
        type: "string",
        pattern: getCodePattern(config.get("credentialsCodeRestrictions.pattern") || "decimal"),
        minLength: config.get("credentialsCodeRestrictions.minLength"),
        maxLength: config.get("credentialsCodeRestrictions.maxLength"),
      },
    },
    required: [],
  },

  api: RestService.buildStandardAPI("credential"),
}
