module.exports = {
	lesssource: {
		files: [ "src/**/*.less" ],
		tasks: [ "less:source" ]
	},

	less: {
		files: [ "src/**/*.less" ],
		tasks: [ "less:dev" ]
	},

	js: {
		// also watch the metadata files and always execute it first
		files: [ "package.json", "bower.json", "src/**/*.js" ],
		tasks: [ "metadata", "requirejs:dev" ]
	},

	metadata: {
		files: [ "package.json", "bower.json" ],
		tasks: [ "metadata" ]
	}
};
