module.exports = {
	options: {
		algorithm: "sha256",
		encoding: "hex",
		dest: "dist/<%= package.name %>-v<%= package.version %>-checksums.txt"
	},

	win32: {
		src: "<%= grunt.config.get('compress.win32.options.archive') %>"
	},
	win64: {
		src: "<%= grunt.config.get('compress.win64.options.archive') %>"
	},

	osx32: {
		src: "<%= grunt.config.get('compress.osx32.options.archive') %>"
	},
	osx64: {
		src: "<%= grunt.config.get('compress.osx64.options.archive') %>"
	},

	linux32: {
		src: "<%= grunt.config.get('compress.linux32.options.archive') %>"
	},
	linux64: {
		src: "<%= grunt.config.get('compress.linux64.options.archive') %>"
	}
};
