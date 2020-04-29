const createArchive = require( "../common/archive" );


module.exports = {
	permissions_osx64: {
		command: "chmod -R g=u,o=u,g-w,o-w <%= dir.releases %>/<%= package.name %>/osx64"
	},
	permissions_linux32: {
		command: "chmod -R g=u,o=u,g-w,o-w <%= dir.releases %>/<%= package.name %>/linux32"
	},
	permissions_linux64: {
		command: "chmod -R g=u,o=u,g-w,o-w <%= dir.releases %>/<%= package.name %>/linux64"
	},

	// delete "product_string" field from package.json on macOS
	// https://github.com/nwjs/nw.js/issues/7253
	packagejson_osx64: {
		cwd: [
			"<%= dir.releases %>",
			"<%= package.name %>",
			"osx64",
			"<%= package.name %>.app",
			"Contents",
			"Resources",
			"app.nw"
		].join( "/" ),
		command: "str=\"$(jq 'del(.product_string)' package.json)\" && echo \"$str\" > package.json"
	},

	archive_win32: createArchive( "win32", "zip" ),
	archive_win64: createArchive( "win64", "zip" ),
	archive_osx64: createArchive( "osx64", "tgz" ),
	archive_linux32: createArchive( "linux32", "tgz" ),
	archive_linux64: createArchive( "linux64", "tgz" ),

	installer_win32: {
		command: [
			"mkdir -p \"<%= dir.tmp_installer %>\"",
			"makensis -v3 \"<%= dir.tmp_installer %>/win32installer/installer.nsi\""
		].join( " && " )
	},
	installer_win64: {
		command: [
			"mkdir -p \"<%= dir.tmp_installer %>\"",
			"makensis -v3 \"<%= dir.tmp_installer %>/win64installer/installer.nsi\""
		].join( " && " )
	}
};
