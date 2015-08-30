module.exports = {
	win32: {
		before: [ "clean:release_win32" ],
		after : [ "copy:win32scripts" ]
	},
	win64: {
		before: [ "clean:release_win64" ],
		after : [ "copy:win64scripts" ]
	},

	osx32: {
		before: [ "clean:release_osx32" ]
	},
	osx64: {
		before: [ "clean:release_osx64" ]
	},

	linux32: {
		before: [ "clean:release_linux32" ],
		after : [ "copy:linux32scripts", "copy:linux32icons" ]
	},
	linux64: {
		before: [ "clean:release_linux64" ],
		after : [ "copy:linux64scripts", "copy:linux64icons" ]
	}
};
