// This was once the config file for grunt-contrib-compress, but since deterministic archives
// can't be created with this lib and its dependencies and since it hasn't seen any activity in
// recent years, the "compress" task was dropped in favor of the shell task with custom
// compression targets that execute system utilities for creating and compressing archives.
// The compress config file will be kept for holding input, prefix and output values
// that get referenced by various other tasks and configs.
module.exports = {
	win32: {
		input: "<%= dir.releases %>/<%= package.name %>/win32",
		prefix: "<%= package.name %>",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-win32.zip"
	},
	win64: {
		input: "<%= dir.releases %>/<%= package.name %>/win64",
		prefix: "<%= package.name %>",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-win64.zip"
	},
	osx64: {
		input: "<%= dir.releases %>/<%= package.name %>/osx64/<%= package.name %>.app",
		prefix: "<%= main['display-name'] %>.app",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-macOS.tar.gz"
	},
	linux32: {
		input: "<%= dir.releases %>/<%= package.name %>/linux32",
		prefix: "<%= package.name %>",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-linux32.tar.gz"
	},
	linux64: {
		input: "<%= dir.releases %>/<%= package.name %>/linux64",
		prefix: "<%= package.name %>",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-linux64.tar.gz"
	}
};
