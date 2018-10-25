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
        model: "door",
      },
      zoneTo: {
        title: "Zone to",
        type: "integer",
        model: "zone",
      },
    },
  },

  api: RestService.buildStandardAPI("accesspoint"),
}
