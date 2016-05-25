module.exports = {
	options: {
		logConcurrentOutput: true
	},

	watchbuild: [ "watch:js", "watch:less" ],
	runbuild: [ "run:build", "concurrent:watchbuild" ],

	watchsrc: [ "watch:metadata", "watch:lesssource" ],
	runsrc: [ "run:src", "concurrent:watchsrc" ]
};
