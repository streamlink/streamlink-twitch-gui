module.exports = {
	win32archive: {
		platform: "win32",
		tasks: [ "shell:win32archive" ],
		checksum: "<%= compress.win32.output %>"
	},
	win64archive: {
		platform: "win64",
		tasks: [ "shell:win64archive" ],
		checksum: "<%= compress.win64.output %>"
	},

	osx64archive: {
		platform: "osx64",
		tasks: [ "shell:osx64archive" ],
		checksum: "<%= compress.osx64.output %>"
	},

	linux32archive: {
		platform: "linux32",
		tasks: [ "shell:linux32archive" ],
		checksum: "<%= compress.linux32.output %>"
	},
	linux64archive: {
		platform: "linux64",
		tasks: [ "shell:linux64archive" ],
		checksum: "<%= compress.linux64.output %>"
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
