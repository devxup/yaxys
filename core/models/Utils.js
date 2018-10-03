const jwt = require("jsonwebtoken");

module.exports = {
  api: {
    "constants": [
      async (ctx) => {
        ctx.body = `window.yaxysConstants = ${ JSON.stringify(UtilService.constants) };`;
      }
    ]
  }
};
