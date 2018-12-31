module.exports = {
  schema: {
    title: "User Profile",
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
    required: ["name"],
  },

  api: RestService.buildStandardAPI("userprofile"),
}
