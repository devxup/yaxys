module.exports = {
  checkAndInjectOperator: (ctx, next) => {
    try {
      ctx.operator = AuthService.checkAndDecodeToken(ctx.cookies.get("jwt"));
      next();
    } catch (err) {
      ctx.throw(401, "unauthorized");
    }
  },

  async debugRandomWaiterProperty(ctx, next) {
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.7
            ? resolve()
            : reject();
        }, 1000);
      });
    } catch(err) {
      ctx.throw("Test exception", { expose : true });
    }
    return next();
  },

  encodePasswords(schemaKey) {
    return async (ctx, next) => {
      if (!ctx.request.body || !Object.keys(ctx.request.body).length) { return next(); }

      const schema = yaxys.models[schemaKey].schema;
      ModelService.encryptPasswordProperties(ctx.request.body, schema);

      await next();
    }
  },

  removePasswordsFromResponse(schemaKey) {
    return async (ctx, next) => {
      await next();
      if (typeof ctx.body !== "object") { return; }

      const schema = yaxys.models[schemaKey].schema;
      if (Array.isArray(ctx.body)) {
        ctx.body.forEach(item => ModelService.removePasswordProperties(item, schema));
      } else {
        ModelService.removePasswordProperties(ctx.body, schema);
      }
    }
  }
};
