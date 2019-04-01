module.exports = {
  schema: {
    title: "User Profile",
    i18Key: "USER_PROFILE",
    timestamps: true,
    webhook: true,
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
      users: {
        title: "Users",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "UserProfileBinding",
          linkerMyAttribute: "userProfile",
          linkerRelatedAttribute: "user",
        },
      },
    },
    required: ["name"],
  },

  api: RestService.buildStandardAPI("userprofile"),

  hooks: {
    "delete:after": async (trx, old) => {
      const relatedEntities = ["accessright", "userprofilebinding"]

      for (const entity of relatedEntities) {
        const items = await yaxys.db.find(trx, entity, { userProfile: old.id })
        for (const item of items) {
          await yaxys.db.delete(trx, entity, item.id)
        }
      }
    },
  },
}
