module.exports = {
  schema: {
    title: "Door",
    defaultProperties: ["id", "name", "description"],
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
  },

  api: RestService.buildStandardAPI("door"),
}
