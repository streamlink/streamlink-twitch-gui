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
		cwd				: "build/releases/<%= package.name %>/osx",
		src				: [ "**" ],
		dest			: "", // no archive subfolder for osx... the package already is a folder
		mode			: function( file ) {
			return /\.app\/Contents\/(?:Frameworks|MacOS)\//.test( file ) ? 0755 : 0644;
		}
	},
	linux32			: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-linux32.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/linux32",
		src				: [ "**" ],
		dest			: "<%= package.name %>",
		mode			: function( file ) {
			return /\.sh$/.test( file ) ? 0755 : 0644;
		}
	},
	linux64			: {
		options			: { archive: "dist/<%= package.name %>-v<%= package.version %>-linux64.tar.gz" },
		expand			: true,
		cwd				: "build/releases/<%= package.name %>/linux64",
		src				: [ "**" ],
		dest			: "<%= package.name %>",
		mode			: function( file ) {
			return /\.sh$/.test( file ) ? 0755 : 0644;
		}
	}
};
