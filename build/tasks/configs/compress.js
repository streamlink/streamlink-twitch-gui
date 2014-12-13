module.exports = {
	options: {
		mode : "tgz",
		level: 9
	},

	win32: {
		options: {
			mode   : "zip",
			archive: "dist/<%= package.name %>-v<%= package.version %>-win32.zip"
		},
		expand : true,
		cwd    : "build/releases/<%= package.name %>/win32",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	},
	win64: {
		options: {
			mode   : "zip",
			archive: "dist/<%= package.name %>-v<%= package.version %>-win64.zip"
		},
		expand : true,
		cwd    : "build/releases/<%= package.name %>/win64",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	},

	osx32: {
		options: {
			archive: "dist/<%= package.name %>-v<%= package.version %>-osx32.tar.gz"
		},
		expand : true,
		cwd    : "build/releases/<%= package.name %>/osx32/<%= package.name %>.app/",
		src    : [ "**" ],
		dest   : "<%= package.config['display-name'] %>.app/"
	},
	osx64: {
		options: {
			archive: "dist/<%= package.name %>-v<%= package.version %>-osx64.tar.gz"
		},
		expand : true,
		cwd    : "build/releases/<%= package.name %>/osx64/<%= package.name %>.app/",
		src    : [ "**" ],
		dest   : "<%= package.config['display-name'] %>.app/"
	},

	linux32: {
		options: {
			archive: "dist/<%= package.name %>-v<%= package.version %>-linux32.tar.gz"
		},
		expand : true,
		cwd    : "build/releases/<%= package.name %>/linux32",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	},
	linux64: {
		options: {
			archive: "dist/<%= package.name %>-v<%= package.version %>-linux64.tar.gz"
		},
		expand : true,
		cwd    : "build/releases/<%= package.name %>/linux64",
		src    : [ "**" ],
		dest   : "<%= package.name %>"
	}
};
