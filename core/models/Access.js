module.exports = {
  api: {
    "accesspoint/:id/access": [
      async ctx => {
        ctx.body = await AccessService.getCredentialAccessesByAccessPointId(ctx.params.id)
      },
    ],
    "credential/:code/access": [
      async ctx => {
        ctx.body = await AccessService.getCredentialAccessesByCredentialCode(ctx.params.code)
      },
    ],
  },
}
