module.exports = {
	api: {
		"language/:lng": ctx => {
			if (!yaxys.locales[ctx.params.lng]) {
				ctx.throw(400, "No such language")
			}
			ctx.response.body = yaxys.locales[ctx.params.lng]
		},
	},
}
