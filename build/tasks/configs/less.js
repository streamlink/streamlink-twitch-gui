module.exports = {
	options: {
		relativeUrls: true,
		strictMath  : true,
		strictUnits : true
	},

	dev: {
		options: {
			sourceMap        : true,
			sourceMapFilename: "build/tmp/styles/app.css.map",
			outputSourceFiles: true,
			sourceMapBasepath: "src",
			sourceMapRootpath: "../",
			sourceMapURL     : "app.css.map"
		},
		src    : "src/styles/app.less",
		dest   : "build/tmp/styles/app.css"
	},

	prod: {
		options: {
			plugins: [
				new ( require( "less-plugin-clean-css" ) )()
			]
		},
		src    : "src/styles/app.less",
		dest   : "build/tmp/styles/app.css"
	}
};
