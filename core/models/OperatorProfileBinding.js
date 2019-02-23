module.exports = {
  schema: {
    bindingRightTitle: "Assign profiles to operators",
    uniqueKeys: {
      operatorAndProfile: ["operator", "operatorProfile"],
    },
    properties: {
      id: {
        type: "integer",
      },
      operator: {
        type: "integer",
        connection: {
          type: "m:1",
          relatedModel: "Operator",
        },
      },
      operatorProfile: {
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
