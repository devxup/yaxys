module.exports = {
  schema: {
    bindingRightTitle: "Assign profiles to users",
    bindingRightI18Key: "RIGHT_FOR_USER_PROFILE_BINDING",
    uniqueKeys: {
      userAndProfile: ["user", "userProfile"],
    },
    properties: {
      id: {
        type: "integer",
      },
      user: {
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "user",
        },
      },
      userProfile: {
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "userprofile",
        },
      },
    },
    required: ["user", "userProfile"],
  },

  api: RestService.buildStandardAPI("userprofilebinding", {
    exclude: "update",
  }),
}
