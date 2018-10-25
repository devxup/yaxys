module.exports = {
  schema: {
    title: "Zone",
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
