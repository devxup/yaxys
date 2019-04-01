module.exports = {
  schema: {
    title: "Zone",
    i18Key: "ZONE",
    timestamps: true,
    webhook: true,
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
          relatedModel: "accesspoint",
          relatedModelAttribute: "zoneTo",
        },
      },
      doors: {
        title: "Doors",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "accesspoint",
          linkerMyAttribute: "zoneTo",
          linkerRelatedAttribute: "door",
        },
        isHidden: settings => settings.hideDoors,
      },
    },
  },

  api: RestService.buildStandardAPI("zone"),

  hooks: {
    "delete:after": async (trx, old) => {
      const accessRights = await yaxys.db.find(trx, "accessright", { user: old.id })
      for (const accessRight of accessRights) {
        await yaxys.db.delete(trx, "accessright", accessRight.id)
      }
    },
  },
}
