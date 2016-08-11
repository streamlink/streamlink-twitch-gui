module.exports = {
	less: {
		files: [ "src/**/*.less" ],
		tasks: [ "less:dev" ]
	},

	js: {
		files: [ "src/config/*.json", "src/metadata.json", "src/**/*.js" ],
		tasks: [ "webpack:dev" ]
	},

	metadata: {
		files: [ "package.json", "bower.json" ],
		tasks: [ "metadata" ]
	}
};
