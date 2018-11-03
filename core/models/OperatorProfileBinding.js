module.exports = {
  schema: {
    uniqueKeys: {
      operatorAndProfile: ["operator", "operatorProfile"],
    },
    properties: {
      id: {
        type: "integer",
      },
      operator: {
        title: "Operator",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "Operator",
        },
      },
      operatorProfile: {
        title: "Operator Profile",
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "OperatorProfile",
        },
      },
    },
    required: ["operator", "operatorProfile"],
  },

  api: RestService.buildStandardAPI("operatorprofilebinding", {
    exclude: "update",
  }),
}
