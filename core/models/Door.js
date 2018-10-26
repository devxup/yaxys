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
      accessPoints: {
        title: "Access points",
        type: "array",
        virtual: true,
        connection: {
          type: "1:m",
          relatedModel: "AccessPoint",
          relatedModelAttribute: "door",
        },
      },
    },
  },

  api: RestService.buildStandardAPI("door"),
}
