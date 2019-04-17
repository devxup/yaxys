module.exports = {
  api: {
    "accesspoint/:id/access": [
      PolicyService.hmacAuth,
      PolicyService.checkAndInjectOperator,
      PolicyService.hasOperator,
      async ctx => {
        ctx.body = await AccessService.getCredentialAccessesByAccessPointId(ctx.params.id)
      },
    ],
    "credential/:code/access": [
      PolicyService.hmacAuth,
      PolicyService.checkAndInjectOperator,
      PolicyService.hasOperator,
      async ctx => {
        ctx.body = await AccessService.getCredentialAccessesByCredentialCode(ctx.params.code)
      },
    ],
  },
}
