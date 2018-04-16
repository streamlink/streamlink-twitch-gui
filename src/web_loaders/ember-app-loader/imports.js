module.exports = [
	{
		dir: "data",
		regex: /\.js$/
	},
	{
		dir: "ui",
		regex: /\.(js|hbs)$/
	},
	{
		dir: "services",
		regex: /^services[\/\\]([^\/\\]+([\/\\]service)?)\.js$/
	}
];
