module.exports = {
  schema: {
    title: "Access Point",
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
          relatedModel: "Door",
        },
      },
      zoneTo: {
        title: "Zone to",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "Zone",
        },
      },
    },
  },

  api: RestService.buildStandardAPI("accesspoint"),
}
