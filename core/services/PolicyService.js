module.exports = {
  checkAndInjectOperator: (ctx, next) => {
    try {
      ctx.operator = AuthService.checkAndDecodeToken(ctx.cookies.get("jwt"));
      next();
    } catch (err) {
      ctx.throw(401, "unauthorized");
    }
  }
};
