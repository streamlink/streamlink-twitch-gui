module.exports = {
	win32archive: {
		platform: "win32",
		tasks: [ "compress:win32" ],
		checksum: "<%= compress.win32.options.archive %>"
	},
	win64archive: {
		platform: "win64",
		tasks: [ "compress:win64" ],
		checksum: "<%= compress.win64.options.archive %>"
	},

	osx64archive: {
		platform: "osx64",
		tasks: [ "compress:osx64" ],
		checksum: "<%= compress.osx64.options.archive %>"
	},

	linux32archive: {
		platform: "linux32",
		tasks: [ "compress:linux32" ],
		checksum: "<%= compress.linux32.options.archive %>"
	},
	linux64archive: {
		platform: "linux64",
		tasks: [ "compress:linux64" ],
		checksum: "<%= compress.linux64.options.archive %>"
	}
};
