module.exports = {
	chocolatey: {
		command: [
			"cd <%= dir.package %>/chocolatey",
			"choco pack -y"
		].join( " && " )
	},

	win32installer: {
		command: "makensis -v3 <%= dir.package %>/win32installer/installer.nsi"
	},

	win64installer: {
		command: "makensis -v3 <%= dir.package %>/win64installer/installer.nsi"
	}
};
