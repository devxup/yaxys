module.exports = {
  schema: {
    title: "Operator Profile",
    i18Key: "OPERATOR_PROFILE",
    properties: {
      id: {
        type: "integer",
      },
      name: {
        title: "Name",
        type: "string",
      },
      description: {
        title: "Description",
        type: "string",
      },
      rights: {
        type: "object",
      },
      operators: {
        title: "Operators",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "OperatorProfileBinding",
          linkerMyAttribute: "operatorProfile",
          linkerRelatedAttribute: "operator",
        },
      },
    },
    required: ["name"],
  },

  api: RestService.buildStandardAPI("operatorprofile"),

  hooks: {
    "delete:after": async (trx, old) => {
      const bindings = await yaxys.db.find(trx, "operatorprofilebinding", { operatorProfile: old.id })
      for (const binding of bindings) {
        await yaxys.db.delete(trx, "operatorprofilebinding", binding.id)
      }
    },
  },
}
