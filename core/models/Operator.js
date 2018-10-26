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
      hasCustomRights: {
        title: "Has custom rights",
        readOnly: true,
        type: "boolean",
      },
      profiles: {
        title: "Operator profiles",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "OperatorProfileBinding",
          linkerMyAttribute: "operator",
          linkerRelatedAttribute: "operatorProfile",
        },
      },
    },
    required: ["email", "passwordHash"],
  },

  hooks: {
    "create:before": (trx, blank) => {
      blank.hasCustomRights = AuthService.hasCustomRights(blank)
    },
    "update:before": (trx, old, patch) => {
      patch.hasCustomRights = AuthService.hasCustomRights(old, patch)
    },
  },

  api: RestService.buildStandardAPI("operator", { hasPasswords: true }),
}
