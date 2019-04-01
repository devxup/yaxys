module.exports = {
  schema: {
    title: "Access Right",
    i18Key: "AR",
    timestamps: true,
    uniqueKeys: {
      integrity: ["user", "userProfile", "accessPoint", "door", "zoneTo"],
    },
    properties: {
      id: {
        type: "integer",
      },

      // Side of the user
      user: {
        title: "User",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "User",
        },
      },
      userProfile: {
        title: "User profile",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "UserProfile",
        },
      },

      // Side of the hardware
      accessPoint: {
        title: "Access point",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "AccessPoint",
        },
      },
      door: {
        title: "Door",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "Door",
        },
        isHidden: settings => !settings.useDoors,
      },
      zoneTo: {
        title: "Zone",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "Zone",
        },
        isHidden: settings => !settings.useZones,
      },
    },
  },

  api: RestService.buildStandardAPI("accessright", {
    exclude: "update",
  }),

  hooks: {
    "create:after": async (trx, item) => {
      AccessService.checkAccessRightIntegrity(item)
      if (item.user) {
        await AccessService.updateUserHasCustomRights(trx, item.user)
      }
    },
    "delete:after": async (trx, deleted) => {
      if (!deleted.user) { return }

      // the delete of access right might be initiated by deleting the user –
      // in this case user won't exist for the moment
      const user = await yaxys.db.findOne(trx, "user", { id: deleted.user })
      if (!user) { return }

      await AccessService.updateUserHasCustomRights(trx, deleted.user)
    },
  },
}
