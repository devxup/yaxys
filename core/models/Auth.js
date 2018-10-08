module.exports = {
  api: {
    "post auth": [
      async (ctx) => {
        try {
          let operator = await AuthService.getOperatorByCredentials(ctx.request.body.email, ctx.request.body.password);
          ctx.cookies.set("jwt", AuthService.generateToken(operator));
          ctx.response.status=200;
        } catch (err) {
          ctx.throw(403, "Wrong email or password");
        }
      }
    ],
    "auth/me": [
      PolicyService.checkAndInjectOperator,
      (ctx) => {
        ctx.response.body = ctx.operator;
      }
    ]
  }
};
