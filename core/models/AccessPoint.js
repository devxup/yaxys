module.exports = {
  schema: {
    title: "Access Point",
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
      door: {
        title: "Door",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "door",
        },
      },
      zoneTo: {
        title: "Zone to",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "zone",
        },
      },
    },
    required: ["title"],
  },

  api: RestService.buildStandardAPI("accesspoint"),
}
