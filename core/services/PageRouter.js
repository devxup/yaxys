const config = require("config");
const Router = require("koa-router");
const KoaStatic = require("koa-static");

module.exports = class PageRouter extends Router {
  constructor() {
    super();
    this._setStaticRouting();
    this.get("*", PageRouter._servePages);
  }

  async _setStaticRouting() {
    if (config.util.getEnv("NODE_ENV") === "development" && !Number(process.env.SERVER_ONLY)) {
      const webpack = require("webpack");
      const webpackDevMiddleware = require("koa-webpack-dev-middleware");
      const webpackConfig = require("../../webpack.dev.js");
      const webpackCompiler = webpack(webpackConfig);

      this.get("/bundle.js", webpackDevMiddleware(webpackCompiler, {
        stats: { colors: true }
      }));
    } else {
      this.use(KoaStatic("public"));
    }
  }

  static _servePages(ctx) {
    ctx.body = `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" href="/img/favicon.ico">
    <title>Yaxys</title>
        
    <link href="https://fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Roboto:100,200,300,400,500,700,900" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
  </body>
  <script src="/api/constants" type="text/javascript"></script>
  <script src="/bundle.js"></script>
</html>`;
  }
};
