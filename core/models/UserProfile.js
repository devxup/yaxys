module.exports = {
  schema: {
    title: "User Profile",
    properties: {
      id: {
        type: "integer",
      },
      title: {
        title: "Title",
        type: "string",
      },
      description: {
        title: "Description",
        type: "string",
      },
      users: {
        title: "users",
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
    required: ["title"],
  },

  api: RestService.buildStandardAPI("userprofile"),
}
