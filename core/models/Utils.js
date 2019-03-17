module.exports = {
  api: {
    constants: [
      async ctx => {
        ctx.body = `window.yaxysConstants = ${JSON.stringify(UtilService.constants)};`
      },
    ],
    "localizedSchemas/:lng": ctx => {
      ctx.body = JSON.stringify(UtilService.localizedSchemas[ctx.params.lng])
    },
    "language/:lng": ctx => {
      if (!yaxys.locales[ctx.params.lng]) {
        ctx.throw(400, "No such language")
      }
      ctx.response.body = yaxys.locales[ctx.params.lng]
    },
  },
}
