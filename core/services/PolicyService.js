const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  checkAndInjectOperator: async (ctx, next) => {
    try {
      ctx.operator = AuthService.checkAndDecodeToken(ctx.cookies.get("jwt"));
      await next();
    } catch (err) {
      ctx.throw(401, "unauthorized");
    }
  },

  hasRight: (modelKey, right) => {
    return async (ctx, next) => {
      if (AuthService.checkRight(ctx.operator, modelKey, right)) {
        await next();
      } else {
        ctx.throw(403, "You don't have rights to perform this action");
      }
    }
  }
};
