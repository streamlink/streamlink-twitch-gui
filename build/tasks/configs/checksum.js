module.exports = {
	options: {
		algorithm: "sha256",
		encoding: "hex",
		dest: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-checksums.txt"
	},

	win32: {
		src: "<%= compress.win32.options.archive %>"
	},
	win64: {
		src: "<%= compress.win64.options.archive %>"
	},

	osx32: {
		src: "<%= compress.osx32.options.archive %>"
	},
	osx64: {
		src: "<%= compress.osx64.options.archive %>"
	},

	linux32: {
		src: "<%= compress.linux32.options.archive %>"
	},
	linux64: {
		src: "<%= compress.linux64.options.archive %>"
	}
};
