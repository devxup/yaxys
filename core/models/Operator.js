module.exports = {
  schema: {
    title: "Operator",
    properties: {
      id: {
        type: "integer",
      },
      name: {
        title: "Name",
        type: "string",
      },
      login: {
        title: "Login",
        type: "string",
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
        type: "object",
      },
      isAdministrator: {
        title: "Is administrator",
        type: "boolean",
        default: false,
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
    required: ["passwordHash"],
  },

  hooks: {
    "create:before": (trx, blank) => {
      AuthService.checkOperatorIntegrity(blank)
      if (!blank.name) {
        blank.name = blank.login
          ? blank.login
          : String(blank.email).replace(/@.*$/, "")
      }
    },
    "update:before": (trx, old, patch) => {
      AuthService.checkOperatorIntegrity(old, patch)
    },
  },

  api: RestService.buildStandardAPI("operator", { hasPasswords: true }),
}
