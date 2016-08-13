module.exports = {
	dev: {
		files: [ "src/config/*.json", "src/**/*.js", "src/**/*.less" ],
		tasks: [ "webpack:dev" ]
	}
};
