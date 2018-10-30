module.exports = {
  schema: {
    title: "Door",
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
      zones: {
        title: "Zones",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "AccessPoint",
          linkerMyAttribute: "door",
          linkerRelatedAttribute: "zoneTo",
        },
      },
    },
    required: ["title"],
  },

  api: RestService.buildStandardAPI("door"),
}
