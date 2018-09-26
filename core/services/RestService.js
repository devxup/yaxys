module.exports = {
  findOne(schemaKey) {
    return async (ctx) => {
      if (!ctx.params.id) { ctx.throw(400, "id is required"); }
      const instance =  await yaxys.db.findOne(schemaKey, { id: ctx.params.id });
      if (!instance) { ctx.throw(404, `${schemaKey} #${ctx.paramms.id} not found`); }
      ctx.body = instance;
    }
  },

  find(schemaKey) {
    return async (ctx) => {
      const options = {};
      const filter = {};
      _.each(ctx.query, (v, k) => {
        switch (k) {
          case "skip":
          case "limit":
          case "sort":
          case "select":
            options[k] = v;
            break;
          default:
            filter[k] = v;
            break;
        }
      });

      ctx.body = await yaxys.db.find(schemaKey, filter, options);
    }
  },

  update(schemaKey) {
    return async (ctx) => {
      if (!ctx.params.id) { ctx.throw(400, "id is required"); }

      ctx.body = await yaxys.db.update(schemaKey, ctx.params.id, ctx.request.body);
    };
  },

  create(schemaKey) {
    return async (ctx) => {
      ctx.body = await yaxys.db.create(schemaKey, ctx.request.body);
    };
  }
};
