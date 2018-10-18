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
    },
    required: ["title"],
  },

  api: {
    "operatorprofile/:id": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operatorprofile", "read"),
      RestService.findOne("operatorprofile"),
    ],
    "operatorprofile": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operatorprofile", "read"),
      RestService.find("operatorprofile"),
    ],
    "put operatorprofile/:id": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operatorprofile", "update"),
      RestService.update("operatorprofile"),
    ],
    "post operatorprofile": [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight("operatorprofile", "create"),
      RestService.create("operatorprofile"),
    ],
  },
}
