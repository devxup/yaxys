module.exports = {
  schema: {
    hidden: true,
    properties: {
      id: {
        type: "integer",
      },
      operator: {
        title: "Operator",
        type: "integer",
        model: "Operator",
      },
      operatorProfile: {
        title: "Operator Profile",
        type: "integer",
        model: "OperatorProfile",
      },
    },
    required: [],
  },

  api: {

  },
}
