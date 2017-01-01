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
		command: "makensis -v3 <%= dir.package %>/win32installer/installer.nsi"
	},

	win64installer: {
		command: "makensis -v3 <%= dir.package %>/win64installer/installer.nsi"
	}
};
