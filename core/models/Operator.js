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
    "/api/operator/:id": [
      RestService.findOne("operator")
    ],
    "/api/operator": [
      RestService.find("operator")
    ],
    "put /api/operator/:id": [
      RestService.update("operator")
    ],
    "post /api/operator": [
      RestService.create("operator")
    ]
  }
};
