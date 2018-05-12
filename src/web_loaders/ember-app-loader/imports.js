module.exports = [
	{
		dir: "data",
		regex: /\.js$/
	},
	{
		dir: "init",
		regex: /^init\/((?:instance-)?initializer)s\/([^\/]+(\/\1)?)\.js$/
	},
	{
		dir: "ui",
		regex: /\.(js|hbs)$/
	},
	{
		dir: "services",
		regex: /^(service)s\/([^\/]+(\/\1)?)\.js$/
	}
];
