const config = require("config")

module.exports = {
  schema: {
    title: "User",
    i18Key: "USER",
    timestamps: true,
    webhook: true,
    defaultProperties: ["id", "name"],
    properties: {
      id: {
        type: "integer",
      },
      name: {
        title: "Name",
        type: "string",
      },
      profiles: {
        title: "User profiles",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "UserProfileBinding",
          linkerMyAttribute: "user",
          linkerRelatedAttribute: "userProfile",
        },
      },
      hasCustomRights: {
        title: "Has custom rights",
        readOnly: true,
        type: "boolean",
      },
      credentials: {
        title: "Credentials",
        type: "array",
        virtual: true,
        connection: {
          type: "1:m",
          relatedModel: "Credential",
          relatedModelAttribute: "user",
        },
      },
      credentialCode: {
        type: "string",
        virtual: true,
        hidden: true,
      },
    },
    required: ["name"],
  },

  api: RestService.buildStandardAPI(
    "user",
    config.get("settings.singleCredential")
      ? {
        update: {
          before: UserService.singleCredentialUpdateMiddleware,
        },
        findOne: {
          before: UserService.singleCredentialFindOneMiddleware,
        },
        find: {
          before: UserService.singleCredentialFindMiddleware,
        },
      }
      : {}
  ),

  hooks: {
    "delete:after": async (trx, old) => {
      const relatedEntities = ["accessright", "credential", "userprofilebinding"]

      for (const entity of relatedEntities) {
        const items = await yaxys.db.find(trx, entity, { user: old.id })
        for (const item of items) {
          await yaxys.db.delete(trx, entity, item.id)
        }
      }
    },
  },
}
