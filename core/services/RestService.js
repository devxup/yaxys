const config = require("config")

module.exports = {
  /**
   * @typedef {Object} APIOptions
   * @property {String|String[]} [exclude=null] - List of methods to exclude
   * into create and update
   */

  /**
   * Generate standard API for the model
   * @param {String} [identity] The identity of the model
   * @param {APIOptions} [options] The options
   * @returns {Object} API object
   */
  buildStandardAPI(identity, options = {}) {
    return ["findOne", "find", "update", "create"].reduce((template, method) => {
      const isRemoved =
        options.exclude === method ||
        (Array.isArray(options.exclude) && options.exclude.includes(method))

      if (!isRemoved) {
        template[
          module.exports.getMethodRoute(identity, method)
        ] = module.exports.getMethodMiddleware(identity, method, options)
      }

      return template
    }, {})
  },

  /**
   * Get route for standard REST method of given model
   * @param {String} [identity] The model identity
   * @param {String} [method] The method
   * @returns {String} The route
   */
  getMethodRoute(identity, method) {
    switch (method) {
      case "findOne":
        return `${identity}/:id`
      case "find":
        return `${identity}`
      case "update":
        return `put ${identity}/:id`
      case "create":
        return `post ${identity}`
    }
    throw new Error(`Unknown API method "${method}" detected`)
  },

  /**
   * Get the list of the middleware for standard REST method of given model
   * @param {String} [identity] The model identity
   * @param {String} [method] The method
   * @param {APIOptions} [options] The options
   * @returns {Function[]} The list of middleware functions
   */
  getMethodMiddleware(identity, method, options = {}) {
    const middleware = [
      PolicyService.checkAndInjectOperator,
      PolicyService.hasRight(identity, method),
    ]
    if (options.hasPasswords) {
      middleware.push(PolicyService.removePasswordsFromResponse(identity))
    }

    if (["create", "update"].includes(method)) {
      middleware.push(PolicyService.sanitizeRequest(identity))
      if (config.get("debug.pauseAndRandomError")) {
        middleware.push(PolicyService.pauseAndRandomError)
      }
    }
    middleware.push(RestService[method]("operator"))

    return middleware
  },

  /**
   * Create the model-specific request handler which responds the single model instance by its id
   * id should be bind by router into ctx.params.id
   * @param {String} identity The model's identity
   * @returns {Function} The handler
   */
  findOne(identity) {
    /**
     * Find the model of given identity by ctx.params.id
     * @param {Object} ctx Koa context
     * @param {String} ctx.params.id The id parameter
     */
    return async ctx => {
      if (!ctx.params.id) {
        ctx.throw(400, "id is required")
      }
      const instance = await yaxys.db.findOne(identity, { id: ctx.params.id })
      if (!instance) {
        ctx.throw(404, `${identity} #${ctx.params.id} not found`)
      }
      ctx.body = instance
    }
  },

  /**
   * Create the model-specific request handler which responds the list of models
   * @param {String} identity The model's identity
   * @returns {Function} The handler
   */
  find(identity) {
    /**
     * Find the models of given identity and request parameters
     * @param {Object} ctx Koa context
     * @param {String} [ctx.params.sort] The sorting order. Can be the JSON like "{p1:1, p2:-1}",
     *                 parameter name like "p1" or negative parameter name like "-p1"
     * @param {String} [ctx.params.skip] How many models to skip (String containing Integer)
     * @param {String} [ctx.params.limit] How maany model to query (String containing Integer)
     */
    return async ctx => {
      const options = {}
      const filter = {}
      _.each(ctx.query, (v, k) => {
        switch (k) {
          case "sort":
            if (/^[a-z0-9_]+$/i.test(v)) {
              options[k] = { [v]: 1 }
            } else if (/^-[a-z0-9_]+$/i.test(v)) {
              options[k] = { [v.slice(1)]: -1 }
            } else if (v.trim()) {
              options[k] = JSON.parse(v)
            }
            break
          case "skip":
          case "limit":
            options[k] = v
            break
          default:
            filter[k] = v
            break
        }
      })

      ctx.body = await yaxys.db.find(identity, filter, options)
    }
  },

  /**
   * Create the model-specific request handler which updates the model by it's id
   * id should be bind by router into ctx.params.id
   * @param {String} identity The model's identity
   * @returns {Function} The handler
   */
  update(identity) {
    /**
     * Update the model of given identity by ctx.params.id
     * @param {Object} ctx Koa context
     * @param {String} ctx.params.id The id parameter
     * @param {String} ctx.request.body The data for updating
     */
    return async ctx => {
      if (!ctx.params.id) {
        ctx.throw(400, "id is required")
      }

      ctx.body = await yaxys.db.update(identity, ctx.params.id, ctx.request.body)
    }
  },

  /**
   * Create the model-specific request handler which creates new model of specified identity
   * @param {String} identity The model's identity
   * @returns {Function} The handler
   */
  create(identity) {
    /**
     * Create the model of given identity
     * @param {Object} ctx Koa context
     * @param {String} ctx.request.body The data to insert
     */
    return async ctx => {
      ctx.body = await yaxys.db.insert(identity, ctx.request.body)
    }
  },
}
