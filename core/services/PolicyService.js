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
  }
};
