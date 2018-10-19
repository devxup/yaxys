module.exports = {
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
      let otmPopulate = []
      let mtmPopulate = []
      if (ctx.query.populate) {
        const parsedArgs = ctx.query.populate.split(",")
        for (let arg of parsedArgs) {
          switch (arg.split(":").length) {
            case 1:
              otmPopulate.push(arg)
              break
            case 3:
              mtmPopulate.push({
                linkerModel: arg.split(":")[0],
                initialModel: arg.split(":")[1],
                modelToLink: arg.split(":")[2],
              })
              break
            default:
              ctx.throw(400, "Bad request")
          }
        }
      }
      const instance = await yaxys.db.findOne(identity, { id: ctx.params.id }, null, null, otmPopulate, mtmPopulate)
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
      let otmPopulate = []
      let mtmPopulate = []
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
          case "populate":
            for (let arg of v.split(",")) {
              switch (arg.split(":").length) {
                case 1:
                  otmPopulate.push(arg)
                  break
                case 3:
                  mtmPopulate.push({
                    linkerModel: arg.split(":")[0],
                    initialModel: arg.split(":")[1],
                    modelToLink: arg.split(":")[2],
                  })
                  break
                default:
                  ctx.throw(400, "Bad request")
              }
            }
            break
          default:
            filter[k] = v
            break
        }
      })

      ctx.body = await yaxys.db.find(identity, filter, options, null, otmPopulate, mtmPopulate)
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
