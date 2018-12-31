module.exports = {
  schema: {
    title: "Access Point",
    defaultProperties: ["id", "name", "description", "door", "zoneTo"],
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
    "update:after": async (trx, old, updated) => {
      if (updated.door) {
        await ZoneService.checkDoorAccessPointsCount(updated.door, trx)
      }
    },
  },
}
