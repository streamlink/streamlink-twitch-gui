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
		dest			: ""
	},
	mac				: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-mac.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/mac",
		src				: [ "**" ],
		dest			: ""
	},
	linux32			: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-linux32.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/linux32",
		src				: [ "**" ],
		dest			: ""
	},
	linux64			: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-linux64.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/linux64",
		src				: [ "**" ],
		dest			: ""
	}
};
