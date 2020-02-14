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

	win32installer: {
		command: [
			"mkdir -p \"<%= dir.tmp_installer %>\"",
			"makensis -v3 \"<%= dir.tmp_installer %>/win32installer/installer.nsi\""
		].join( " && " )
	},
	win64installer: {
		command: [
			"mkdir -p \"<%= dir.tmp_installer %>\"",
			"makensis -v3 \"<%= dir.tmp_installer %>/win64installer/installer.nsi\""
		].join( " && " )
	},

	win32archive: createArchive( "win32", "zip" ),
	win64archive: createArchive( "win64", "zip" ),
	osx64archive: createArchive( "osx64", "tgz" ),
	linux32archive: createArchive( "linux32", "tgz" ),
	linux64archive: createArchive( "linux64", "tgz" )
};
