const config = require("config")

module.exports = {
  api: {
    "post auth": [
      ...(config.get("debug.pause") ? [PolicyService.pause] : []),
      async ctx => {
        try {
          const operator = await AuthService.getOperatorByCredentials(
            ctx.request.body.loginOrEmail,
            ctx.request.body.password
          )
          ctx.cookies.set("jwt", AuthService.generateToken(operator), {
            overwrite: true,
            httpOnly: false,
          })
          ctx.response.body = ""
        } catch (err) {
          ctx.throw(401, ctx.t(err.message))
        }
      },
    ],
    "auth/me": [
      PolicyService.checkAndInjectOperator,
      ctx => {
        ctx.response.body = ctx.operator
      },
    ],
  },
}
