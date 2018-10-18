const config = require("config")

module.exports = {
  schema: {
    title: "Operator",
    properties: {
      id: {
        type: "integer",
      },
      email: {
        title: "E-mail",
        type: "string",
        format: "email",
        unique: true,
      },
      passwordHash: {
        title: "Password",
        type: "string",
        password: true,
      },
      rights: {
        type: "object",
      },
      isAdministrator: {
        type: "boolean",
      },
    },
    required: ["email", "passwordHash"],
  },

  api: {
    "operator/:id": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operator", "read"),
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.findOne("operator"),
    ],
    "operator": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operator", "read"),
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.find("operator"),
    ],
    "put operator/:id": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operator", "update"),

      config.get("debug.pauseAndRandomError")
        ? PolicyService.pauseAndRandomError
        : true,

      PolicyService.encodePasswords("operator"),
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.update("operator"),
    ],
    "post operator": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operator", "create"),
      config.get("debug.pauseAndRandomError")
        ? PolicyService.pauseAndRandomError
        : true,
      PolicyService.encodePasswords("operator"),
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.create("operator"),
    ],
  },
}
