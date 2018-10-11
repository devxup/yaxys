module.exports = {
  schema: {
    properties: {
      id: {
        type: "integer"
      },
      email: {
        title: "E-mail",
        type: "string",
        format: "email"
      },
      passwordHash: {
        title: "Password",
        type: "string",
        password: true
      },
      rights: {
        type: "json"
      },
      isAdministrator: {
        type: "boolean"
      }
    },
    required: ["email", "passwordHash", "rights"]
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
