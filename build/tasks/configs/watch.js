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
		files: [ "src/**/*.js" ],
		tasks: [ "requirejs:dev" ]
	}
};
