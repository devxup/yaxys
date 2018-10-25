module.exports = {
  schema: {
    title: "Door",
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

  api: RestService.buildStandardAPI("door"),
}
