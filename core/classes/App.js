const winston = require("winston")
const config = require("config")
const Koa = require("koa")
const Router = require("koa-router")
const requireAll = require("require-all")
const bodyParser = require("koa-bodyparser")
global._ = require("lodash")

module.exports = class App extends Koa {
  constructor() {
    super()

    this._requireFolder("services")
    this._requireFolder("classes")

    this.db = new Adapter(config.get("db"))
    this.logger = new winston.Logger({
      transports: [
        new winston.transports.Console({
          colorize: config.get("logger.colorize"),
          level: config.get("logger.level"),
        }),
      ],
    })

    const models = this._requireFolder("models")

    // lower-casing models
    this.models = _.mapKeys(models, (value, key) => key.toLowerCase())

    this.apiRouter = new Router({ prefix: "/api/" })

    // going through the models
    // registering their schemas in database, and their API methods in router
    _.each(this.models, (model, key) => {
      _.each(model.api || {}, (handlers, route) => {
        if (model.schema) {
          this.db.registerSchema(key, model.schema)
        }

        let method = "get"
        if (/^(get|post|put|delete)\s/i.test(route)) {
          const parts = route.split(/\s/)
          method = parts[0].toLowerCase()
          route = parts.slice(1).join(" ")
        }

        const handlersList = Array.isArray(handlers) ? handlers : [handlers]

        handlersList.forEach(handler => {
          if (handler === true) { return }
          this.apiRouter[method](route, handler)
        })
      })
    })

    this.apiRouter.use("*", ctx => {
      ctx.body = "not found"
    })

    this.pageRouter = new PageRouter()

    this.use(bodyParser())
    this.use(this.apiRouter.routes())
    this.use(this.pageRouter.routes())
  }

  _requireFolder(folder) {
    const modules = requireAll({
      dirname: `${__dirname}/../${folder}`,
      recursive: false,
    })
    Object.assign(global, modules)
    return modules
  }

  async init() {
    await this.db.init(config.get("db"))
    UtilService.init()
    26
  }
}
