const config = require("config")
const request = require("request")

module.exports = {
  init() {
    if (!config.get("webhook.url")) { return }

    const identities = Object.keys(yaxys.db.schemas)
    for (const identity of identities) {
      const schema = yaxys.db.schemas[identity]
      if (!schema.webhook) {
        continue
      }
      yaxys.db.on(`${identity}:create:after`, module.exports.getWebhook(identity, "create"))
      yaxys.db.on(`${identity}:update:after`, module.exports.getWebhook(identity, "update"))
      yaxys.db.on(`${identity}:delete:after`, module.exports.getWebhook(identity, "delete"))
    }
  },

  _getURL(verb, entity, id) {
    const webhook = config.get("webhook")
    const url = new URL(webhook.url)
    _.each(webhook.additionalGetParameters, (v, k) => {
      url.searchParams.set(k, v)
    })
    url.searchParams.set("verb", verb)
    url.searchParams.set("entity", entity)
    url.searchParams.set("id", id)
    return url.href
  },

  getWebhook (identity, event) {
    const webhook = config.get("webhook")
    return async (trx, a1, a2) => {
      const id = event === "update"
        ? a2.id
        : a1.id

      // we perform the webhook in another thread in order to let the main process continue
      setImmediate(() => {
        const url = module.exports._getURL(event, identity, id)
        yaxys.logger.info("Requesting webhook", url)
        request({
          method: webhook.method || "GET",
          url,
        }, function(err, response, body) {
          if (err) {
            yaxys.logger.error("Webhook failed", url, err.message)
            return
          }

          let bodyToShow = null
          if (typeof body === "string") {
            bodyToShow = body.slice(0, webhook.responseBodySizeLimit)
          } else if (body instanceof Buffer) {
            bodyToShow = body.toString().slice(0, webhook.responseBodySizeLimit)
          } else if (body && typeof body === "object") {
            // JSON is shown without cropping
            bodyToShow = body
          }
          if (Math.floor(Number(response.statusCode) / 100) !== 2) {
            yaxys.logger.error(`Webhook returned wrong status code ${response.statusCode}: for URL`, url)
            yaxys.logger.error("Response body:\r\n", bodyToShow)
            return
          }
          yaxys.logger.info(`Webhook ${url} completed successfully`)
        })
      })
    }
  },
}
