module.exports = {
	options: {
		archive_win32: {
			platform: "win32",
			tasks: [ "shell:archive_win32" ],
			checksum: "<%= compress.win32.output %>"
		},
		archive_win64: {
			platform: "win64",
			tasks: [ "shell:archive_win64" ],
			checksum: "<%= compress.win64.output %>"
		},
		archive_osx64: {
			platform: "osx64",
			tasks: [ "shell:archive_osx64" ],
			checksum: "<%= compress.osx64.output %>"
		},
		archive_linux32: {
			platform: "linux32",
			tasks: [ "shell:archive_linux32" ],
			checksum: "<%= compress.linux32.output %>"
		},
		archive_linux64: {
			platform: "linux64",
			tasks: [ "shell:archive_linux64" ],
			checksum: "<%= compress.linux64.output %>"
		},

		installer_win32: {
			platform: "win32",
			tasks: [
				"clean:installer_win32",
				"template:installer_win32",
				"shell:installer_win32"
			],
			checksum: "<%= dir.dist %>/<%= template.installer_win32.options.data.filename %>"
		},
		installer_win64: {
			platform: "win64",
			tasks: [
				"clean:installer_win64",
				"template:installer_win64",
				"shell:installer_win64"
			],
			checksum: "<%= dir.dist %>/<%= template.installer_win64.options.data.filename %>"
		},

		appimage_linux32: {
			platform: "linux32",
			tasks: [
				"appimagekit",
				"template:appimage_linux32",
				"shell:appimage_linux32"
			],
			checksum: "<%= dir.dist %>/<%= template.appimage_linux32.options.data.filename %>"
		},
		appimage_linux64: {
			platform: "linux64",
			tasks: [
				"appimagekit",
				"template:appimage_linux64",
				"shell:appimage_linux64"
			],
			checksum: "<%= dir.dist %>/<%= template.appimage_linux64.options.data.filename %>"
		}
	}
};
