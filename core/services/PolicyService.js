module.exports = {
  checkAndInjectOperator: async (ctx, next) => {
    try {
      ctx.operator = AuthService.checkAndDecodeToken(ctx.cookies.get("jwt"));
    } catch (err) {
      ctx.throw(401, "unauthorized");
    }
    await next();
  },

  hasRight: (modelKey, right) => async (ctx, next) =>
    (AuthService.checkRight(ctx.operator, modelKey, right))
      ? await next()
      : ctx.throw(403, "You don't have rights to perform this action")
};
