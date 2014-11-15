module.exports = {
	win		: {
		before	: [ "clean:release_win" ]
	},
	osx		: {
		before	: [ "clean:release_osx" ]
	},
	linux32	: {
		before	: [ "clean:release_linux32" ],
		after	: [ "copy:linux32scripts", "copy:linux32icons" ]
	},
	linux64	: {
		before	: [ "clean:release_linux64" ],
		after	: [ "copy:linux64scripts", "copy:linux64icons" ]
	}
};
