module.exports = {
  schema: {
    title: "Credential",
    defaultProperties: ["id", "title", "user", "code"],
    properties: {
      id: {
        type: "integer",
      },
      title: {
        title: "Title",
        type: "string",
      },
      user: {
        title: "User",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "user",
        },
      },
      code: {
        title: "Code",
        type: "string",
      },
    },
    required: [],
  },

  api: RestService.buildStandardAPI("credential"),
}
