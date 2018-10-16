const config = require("config")

module.exports = {
  schema: {
    properties: {
      id: {
        type: "integer",
        unique: true,
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
        type: "json",
      },
      isAdministrator: {
        type: "boolean",
      },
    },
    required: ["email", "passwordHash"],
  },

  api: {
    "operator/:id": [
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.findOne("operator"),
    ],
    "operator": [
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.find("operator"),
    ],
    "put operator/:id": [
      config.get("debug.pauseAndRandomError")
        ? PolicyService.pauseAndRandomError
        : true,
      PolicyService.encodePasswords("operator"),
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.update("operator"),
    ],
    "post operator": [
      config.get("debug.pauseAndRandomError")
        ? PolicyService.pauseAndRandomError
        : true,
      PolicyService.encodePasswords("operator"),
      PolicyService.removePasswordsFromResponse("operator"),
      RestService.create("operator"),
    ],
  },
}
