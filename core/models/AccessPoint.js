module.exports = {
  schema: {
    title: "Access Point",
    defaultProperties: ["id", "title", "description", "door", "zoneTo"],
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
  },

  api: RestService.buildStandardAPI("accesspoint"),

  hooks: {
    "create:after": async (trx, item) => {
      if (item.door) {
        await ZoneService.checkDoorAccessPointsCount(item.door, trx)
      }
    },
    "update:after": async (trx, old, patch) => {
      if (patch.door) {
        await ZoneService.checkDoorAccessPointsCount(patch.door, trx)
      }
    },
  },
}
