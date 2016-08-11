module.exports = {
	options: {
		logConcurrentOutput: true
	},

	// TODO: use webpack watchers and integrate less into webpack
	dev: [
		"run",
		"watch:less",
		"watch:js",
		"watch:metadata"
	]
};
