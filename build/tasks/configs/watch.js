module.exports = {
	less: {
		files: [ "src/**/*.less" ],
		tasks: [ "less:dev" ]
	},

	js: {
		files: [ "src/config/*.json", "src/**/*.js" ],
		tasks: [ "webpack:dev" ]
	}
};
