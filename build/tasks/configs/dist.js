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
		tasks: [ "shell:compressMacOSarchive" ],
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
	},

	win32installer: {
		platform: "win32",
		tasks: [
			"clean:win32installer",
			"template:win32installer",
			"shell:win32installer"
		],
		checksum: "<%= dir.dist %>/<%= template.win32installer.options.data.filename %>"
	},

	win64installer: {
		platform: "win64",
		tasks: [
			"clean:win64installer",
			"template:win64installer",
			"shell:win64installer"
		],
		checksum: "<%= dir.dist %>/<%= template.win64installer.options.data.filename %>"
	}
};
