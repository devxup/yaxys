module.exports = {
  schema: {
    uniqueKeys: {
      integrity: ["user", "userProfile", "accessPoint", "door", "zoneTo"],
    },
    properties: {
      id: {
        type: "integer",
      },

      // Side of the user
      user: {
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "User",
        },
      },
      userProfile: {
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "UserProfile",
        },
      },

      // Side of the granted access right
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
      },
      zoneTo: {
        title: "Zone",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "Zone",
        },
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
      if (deleted.user) {
        await AccessService.updateUserHasCustomRights(trx, deleted.user)
      }
    },
  },
}
