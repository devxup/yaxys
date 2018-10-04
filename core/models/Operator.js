module.exports = {
  schema: {
    properties: {
      id: {
        type: "integer"
      },
      email: {
        type: "string",
        format: "email"
      },
      passwordHash: {
        type: "string",
        format: "email"
      }
    },
    required: ["email"]
  },
  
  api: {
    "operator/:id": [
      RestService.findOne("operator")
    ],
    "operator": [
      RestService.find("operator")
    ],
    "put operator/:id": [
      RestService.update("operator")
    ],
    "post operator": [
      RestService.create("operator")
    ]
  }
};
