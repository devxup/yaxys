module.exports = {
  /**
   * Check the token from the "jwt" cookie, get the operator out of it and inject into the ctx
   * If the token is invalid, throw 401 error
   * @param {Object} ctx Koa context
   * @param {Function} next Koa next function
   */
  checkAndInjectOperator: async (ctx, next) => {
    try {
      ctx.operator = AuthService.checkAndDecodeToken(ctx.cookies.get("jwt"))
    } catch (err) {
      ctx.throw(401, "unauthorized")
    }
    await next()
  },

  /**
   * Make the 1s delay and throw the error with 70% probability
   * Used for debugging pending and error states on the client-side
   * @param {Object} ctx Koa context
   * @param {Function} next Koa next function
   */
  async pauseAndRandomError(ctx, next) {
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.7 ? resolve() : reject()
        }, 1000)
      })
    } catch (err) {
      ctx.throw("Test exception", { expose: true })
    }
    next()
  },

  /**
   * Creates the model-specific policy which encodes all of the password properties in request body
   * @param {String} identity The model's identity
   * @returns {Function} The policy
   */
  encodePasswords(identity) {
    /**
     * If request has body, encode all the password properties using schema for specified identity
     * @param {Object} ctx Koa context
     * @param {Function} next Koa next function
     */
    return async (ctx, next) => {
      if (!ctx.request.body || !Object.keys(ctx.request.body).length) {
        return next()
      }

      const schema = yaxys.models[identity].schema
      ModelService.encryptPasswordProperties(ctx.request.body, schema)

      await next()
    }
  },

  /**
   * Create the model-specific policy which removes all of the password from response body
   * The policy will apply after all of the other handlers are done
   * @param {String} identity The model's identity
   * @returns {Function} The policy
   */
  removePasswordsFromResponse(identity) {
    /**
     * If response is object, remove all the password properties using schema for specified identity
     * @param {Object} ctx Koa context
     * @param {Function} next Koa next function
     */
    return async (ctx, next) => {
      await next()
      if (typeof ctx.body !== "object") {
        return
      }

      const schema = yaxys.models[identity].schema
      if (Array.isArray(ctx.body)) {
        ctx.body.forEach(item => ModelService.removePasswordProperties(item, schema))
      } else {
        ModelService.removePasswordProperties(ctx.body, schema)
      }
    }
  },

  /**
   * Create the policy which checks if the operator has rights to perform some action
   * @param {String} modelKey The name of the model for which we are checking rights
   * @param {String} right The name of the right
   * @returns {Function} The policy
   */
  hasRight: (modelKey, right) =>
    /**
     * If access is granted, call next middleware or throw 403 exception otherwise
     * @param {Object} ctx Koa context
     * @param {Function} next Koa next function
     */
    async (ctx, next) => {
      const accessGranted = await AuthService.checkRight(ctx.operator, modelKey, right)
      accessGranted
        ? await next()
        : ctx.throw(403, "You don't have rights to perform this action")
    },
}
