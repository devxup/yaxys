const config = require("config")
const Router = require("koa-router")
const KoaStatic = require("koa-static")

let mainCSS, bundleJS
if (config.util.getEnv("NODE_ENV") === "production") {
  const webpackAssets = require("../../webpack-assets.json")
  mainCSS = `/${webpackAssets.main.css}`
  bundleJS = `/${webpackAssets.main.js}`
}

module.exports = class PageRouter extends Router {
  constructor() {
    super()
    this._setStaticRouting()
    this.get("*", PageRouter._servePages)
  }

  /**
   * Set the handler for static files routes.
   * In Dev mode, use koa-webpack-dev-middleware
   * In Prod mode, use just StaticRouter
   * @private
   */
  async _setStaticRouting() {
    if (config.util.getEnv("NODE_ENV") === "development" && !Number(process.env.SERVER_ONLY)) {
      const webpack = require("webpack")
      const webpackDevMiddleware = require("koa-webpack-dev-middleware")
      const webpackConfig = require("../../webpack.dev.js")
      const webpackCompiler = webpack(webpackConfig)

      this.get(
        "/bundle.js",
        webpackDevMiddleware(webpackCompiler, {
          stats: { colors: true },
        })
      )
    } else {
      this.use(KoaStatic("public"))
    }
  }

  /**
   * Page requests handler. Return static content for the SPA, later we can o the SSR here.
   * @param {Object} ctx Koa context
   * @private
   */
  static _servePages(ctx) {
    ctx.body = `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Yaxys</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,200,300,400,500,600,700,900">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

    <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Roboto:100,200,300,400,500,600,700,900" rel="stylesheet">
    ${
      config.util.getEnv("NODE_ENV") === "development" 
        ? "" 
        : `<link rel="stylesheet" href=${ mainCSS }>`
    }
  </head>
  <body>
    <div id="root"></div>
  </body>
  <script src="/api/constants" type="text/javascript"></script>
  ${
    config.util.getEnv("NODE_ENV") === "development"
      ? "<script src=\"bundle.js\"></script>"
      : `<script src=${bundleJS}></script>`
  }
</html>`
  }
}

