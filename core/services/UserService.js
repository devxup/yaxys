module.exports = {

  /**
   * When settings.singleCredential mode is on,
   * this mw should be injected for UPDATE /api/user/:id route
   * If the `credentialCode` is provided, it should additionally insert or update first user credential
   * @param {Object} ctx The koa context
   * @param {Function} next The standard mw callback
   * @returns {Promise<void>} nothing
   */
  async singleCredentialUpdateMiddleware(ctx, next) {
    if (!ctx.request.body.hasOwnProperty("credentialCode")) {
      return next()
    }
    const existingCredential = await yaxys.db.findOne(ctx.trx, "credential", { user: ctx.params.id })
    if (existingCredential) {
      await yaxys.db.update(
        ctx.trx,
        "credential",
        existingCredential.id,
        { code: ctx.request.body.credentialCode }
      )
      return next()
    }

    await yaxys.db.insert(
      ctx.trx,
      "credential",
      {
        user: ctx.params.id,
        code: ctx.request.body.credentialCode,
      }
    )
    return next()
  },

  /**
   * When settings.singleCredential mode is on,
   * this mw should be injected for GET /api/user/:id
   * It should find first user credential and inject it into result
   * @param {Object} ctx The koa context
   * @param {Function} next The standard mw callback
   * @returns {Promise<void>} nothing
   */
  async singleCredentialFindOneMiddleware(ctx, next) {
    await next()
    const credential = await yaxys.db.findOne(ctx.trx, "credential", { user: ctx.body.id })
    if (credential) {
      ctx.body.credentialCode = credential.code
    }
  },

  /**
   * When settings.singleCredential mode is on,
   * this mw should be injected for GET /api/user
   * It should find first user credential for each found user and inject it into result
   * @param {Object} ctx The koa context
   * @param {Function} next The standard mw callback
   * @returns {Promise<void>} nothing
   */
  async singleCredentialFindMiddleware(ctx, next) {
    await next()
    const userIds = ctx.body.map(user => user.id)
    const credentials = await yaxys.db.find(ctx.trx, "credential", { user: userIds })

    const hash = {}
    for (const credential of credentials) {
      // Prefer first user's credential, so ignore the rest of them
      if (!hash[credential.user]) {
        hash[credential.user] = credential
      }
    }

    for (const user of ctx.body) {
      if (hash[user.id]) {
        user.credentialCode = hash[user.id].code
      }
    }
  },
}
