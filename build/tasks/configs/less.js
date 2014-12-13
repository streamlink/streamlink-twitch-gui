module.exports = {
	options: {
		compress         : false,
		/*
		 * cleancss still has no soucemap support
		 * https://github.com/gruntjs/grunt-contrib-less/issues/165
		 */
		cleancss         : false,
		relativeUrls     : true,
		strictMath       : true,
		strictUnits      : true,
		sourceMap        : true,
		sourceMapBasepath: "src",
		sourceMapRootpath: "../",
		sourceMapURL     : "app.css.map"
	},

	source: {
		options: {
			sourceMapFilename: "src/styles/app.css.map"
		},
		src    : "src/styles/app.less",
		dest   : "src/styles/app.css"
	},

	dev: {
		options: {
			sourceMapFilename: "build/tmp/styles/app.css.map",
			outputSourceFiles: true
		},
		src    : "src/styles/app.less",
		dest   : "build/tmp/styles/app.css"
	},

	release: {
		options: {
			compress : true,
			sourceMap: false
		},
		src    : "src/styles/app.less",
		dest   : "build/tmp/styles/app.css"
	}
};
