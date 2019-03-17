const winston = require("winston")
const config = require("config")
const Koa = require("koa")
const Router = require("koa-router")
const requireAll = require("require-all")
const bodyParser = require("koa-bodyparser")
global._ = require("lodash")
const i18next = require("i18next")
const Backend = require("i18next-node-fs-backend")
const i18middleware = require("koa-i18next")

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

    this._requireLocales()
		this.languages = []
		for (let locale in this.locales){
			this.languages.push({
				code: locale,
				name: this.locales[locale].LANG_NAME,
			})
		}
		this.schemaLocales = this._requireFolder("locales/schemas")

		i18next
			.use(Backend)
			.init({
				backend: {
					loadPath: `${__dirname}/../locales/backend/{{lng}}.json`,
				},
				lng: config.get("lng"),
				preload: this.languages.map(lng => lng.code),
				fallbackLng: "en_US",
			})
			.then(t => {
				this.t = t
			})
			.catch(err => {
				console.log("Error while loading locales: ", err) //eslint-disable-line
			})

		this.use(i18middleware(i18next, {
				lookupCookie: "language",
				order: ["cookie"],
				next: true,
			})
		)

		const models = this._requireFolder("models")

		// lower-casing models
		this.models = _.mapKeys(models, (value, key) => key.toLowerCase())

		this.apiRouter = new Router({ prefix: "/api/" })

		// going through the models
		// registering their schemas in database, and their API methods in router
		_.each(this.models, (model, identity) => {
			if (model.schema) {
				this.db.registerSchema(identity, model.schema)
			}
			_.each(model.hooks, (listener, event) => {
				this.db.on(`${identity}:${event}`, listener)
			})
			if (model.schema) {
				this.db.registerSchema(identity, model.schema)
			}
			_.each(model.api || {}, (handlers, route) => {
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

	_requireLocales() {
    this.locales = this._requireFolder("locales/frontend")
  }

  refreshLocales() {
    for (const lang of this.languages) {
      delete require.cache[require.resolve(`../locales/frontend/${lang.code}.json`)]
    }
    this._requireLocales()
  }

	/**
	 * Requires the whole folder of Node.js modules and assign them into the global
	 * @param {String} folder The folder to require
	 * @returns {Object} The object containing modules with their filenames as the keys
	 * @private
	 */
	_requireFolder(folder) {
		const modules = requireAll({
			dirname: `${__dirname}/../${folder}`,
			recursive: false,
		})
		Object.assign(global, modules)
		return modules
	}

	/**
	 * Perform all the required initializations
	 * – DB Adapter initialization
	 * – UtilService initialization
	 */
	async init() {
		await this.db.init(config.get("db"))
		UtilService.init()
	}
}
