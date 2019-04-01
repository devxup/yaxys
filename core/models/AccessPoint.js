module.exports = {
  schema: {
    title: "Access Point",
    i18Key: "AP",
    timestamps: true,
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
        isHidden: settings => settings.hideDoors,
      },
      zoneTo: {
        title: "Zone to",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "zone",
        },
        isHidden: settings => settings.hideZones,
      },
    },
  },

  api: RestService.buildStandardAPI("accesspoint"),

  hooks: {
    "create:after": async (trx, item) => {
      if (item.door) {
        await ZoneService.checkDoorAccessPointsCount(trx, item.door)
      }
    },
    "update:after": async (trx, old, updated) => {
      if (updated.door) {
        await ZoneService.checkDoorAccessPointsCount(trx, updated.door)
      }
    },
    "delete:after": async (trx, old) => {
      const accessRights = await yaxys.db.find(trx, "accessright", { accessPoint: old.id })
      for (const accessRight of accessRights) {
        await yaxys.db.delete(trx, "accessright", accessRight.id)
      }
    },
  },
}
