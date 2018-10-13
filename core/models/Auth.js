module.exports = {
  api: {
    "post auth": [
      async ctx => {
        try {
          const operator = await AuthService.getOperatorByCredentials(
            ctx.request.body.email,
            ctx.request.body.password
          )
          ctx.cookies.set("jwt", AuthService.generateToken(operator), {
            overwrite: true,
            httpOnly: false,
          })
          ctx.response.body = ""
        } catch (err) {
          ctx.throw(401, err.message)
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
