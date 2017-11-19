module.exports = {
	win32: {
		options: {
			mode   : "zip",
			level  : 9,
			archive: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-win32.zip"
		},
		expand : true,
		cwd    : "<%= dir.releases %>/<%= package.name %>/win32",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	},
	win64: {
		options: {
			mode   : "zip",
			level  : 9,
			archive: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-win64.zip"
		},
		expand : true,
		cwd    : "<%= dir.releases %>/<%= package.name %>/win64",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	},

	// broken due to symlinks inside the NW.js app folder
	// symlinks are supported by archiver ^2.0.0, but grunt-contrib-compress still uses ^1.3.0
	// see the shell:compressMacOSarchive task instead
	// the other tasks still use the options.archive value defined here, so don't remove it
	osx64: {
		options: {
			mode   : "tgz",
			level  : 9,
			archive: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-macOS.tar.gz"
		},
		expand : true,
		cwd    : "<%= dir.releases %>/<%= package.name %>/osx64/<%= package.name %>.app/",
		src    : [ "**" ],
		dest   : "<%= main['display-name'] %>.app/"
	},

	linux32: {
		options: {
			mode   : "tgz",
			level  : 9,
			archive: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-linux32.tar.gz"
		},
		expand : true,
		cwd    : "<%= dir.releases %>/<%= package.name %>/linux32",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	},
	linux64: {
		options: {
			mode   : "tgz",
			level  : 9,
			archive: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-linux64.tar.gz"
		},
		expand : true,
		cwd    : "<%= dir.releases %>/<%= package.name %>/linux64",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	}
};
