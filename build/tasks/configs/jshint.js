module.exports = {
	app: {
		options: {
			jshintrc: "src/.jshintrc"
		},
		src    : [ "src/**/*.js", "!src/test/**" ]
	},

	test: {
		options: {
			jshintrc: "src/test/.jshintrc"
		},
		src    : [ "src/test/**/*.js" ]
	},

	tasks: {
		options: {
			jshintrc: "build/tasks/.jshintrc"
		},
		src    : [ "build/tasks/**/*.js" ]
	}
};
