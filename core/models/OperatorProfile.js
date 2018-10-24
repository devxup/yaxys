module.exports = {
  schema: {
    title: "Operator Profile",
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
      rights: {
        type: "object",
      },
    },
    required: ["title"],
  },

  api: RestService.buildStandardAPI("operatorprofile", { hasPasswords: true }),
}
