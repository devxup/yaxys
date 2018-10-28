module.exports = {
  schema: {
    title: "Operator Profile",
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
      rights: {
        type: "object",
      },
      operators: {
        title: "Operators",
        type: "array",
        virtual: true,
        connection: {
          type: "m:m",
          linkerModel: "OperatorProfileBinding",
          linkerMyAttribute: "operatorProfile",
          linkerRelatedAttribute: "operator",
        },
      },
    },
    required: ["title"],
  },

  api: RestService.buildStandardAPI("operatorprofile"),
}
