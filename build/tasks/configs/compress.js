module.exports = {
	options			: {
		mode			: "tgz",
		level			: 9
	},
	win				: {
		options			: { mode: "zip", archive: "dist/<%= package.name %>-v<%= package.version %>-win.zip" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/win",
		src				: [ "**" ],
		dest			: "<%= package.name %>"
	},
	osx				: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-osx.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/osx/<%= package.name %>.app/",
		src				: [ "**" ],
		dest			: "<%= package.config['display-name'] %>.app/"
	},
	linux32			: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-linux32.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/linux32",
		src				: [ "**" ],
		dest			: "<%= package.name %>"
	},
	linux64			: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-linux64.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/linux64",
		src				: [ "**" ],
		dest			: "<%= package.name %>"
	}
};
