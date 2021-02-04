module.exports = {
	options: {
		win32: {
			before: [
				"clean:release_win32"
			],
			after: []
		},
		win64: {
			before: [
				"clean:release_win64"
			],
			after: []
		},

		osx64: {
			before: [
				"clean:release_osx64"
			],
			after: [
				"shell:packagejson_osx64",
				"shell:permissions_osx64"
			]
		},

		linux32: {
			before: [
				"clean:release_linux32"
			],
			after: [
				"copy:scripts_linux32",
				"copy:icons_linux32",
				"copy:assets_linux32",
				"shell:permissions_linux32"
			]
		},
		linux64: {
			before: [
				"clean:release_linux64"
			],
			after: [
				"copy:scripts_linux64",
				"copy:icons_linux64",
				"copy:assets_linux64",
				"shell:permissions_linux64"
			]
		}
	}
};
