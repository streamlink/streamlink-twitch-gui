module.exports = {
	win32: {
		before: [ "clean:release_win32" ],
		after : [ "copy:win32scripts" ]
	},
	win64: {
		before: [ "clean:release_win64" ],
		after : [ "copy:win64scripts" ]
	},

	osx64: {
		before: [ "clean:release_osx64" ],
		after: [ "shell:permissions_osx64" ]
	},

	linux32: {
		before: [ "clean:release_linux32" ],
		after : [
			"copy:linux32scripts",
			"copy:linux32icons",
			"shell:permissions_linux32"
		]
	},
	linux64: {
		before: [ "clean:release_linux64" ],
		after : [
			"copy:linux64scripts",
			"copy:linux64icons",
			"shell:permissions_linux64"
		]
	}
};
