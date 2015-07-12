module.exports = {
	options: {
		logConcurrentOutput: true
	},

	devwatchers: [ "watch:less", "watch:js" ],
	runbuild: [ "run:build", "concurrent:devwatchers" ]
};
