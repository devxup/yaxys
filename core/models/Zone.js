module.exports = {
  schema: {
    title: "Zone",
    defaultProperties: ["id", "title", "description"],
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
    },
  },

  api: RestService.buildStandardAPI("zone"),
}
