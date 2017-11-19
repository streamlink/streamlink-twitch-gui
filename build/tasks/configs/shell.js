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

	compressMacOSarchive: {
		command: [
			"cd '<%= compress.osx64.cwd %>'",
			"tar -czf"
				+ " '<%= compress.osx64.options.archive %>'"
				// use --transform feature of GNU tar to set the custom prefix path
				// set flags=r to ignore prefix when archiving symlinks
				// https://stackoverflow.com/a/29661783
				+ " --transform 'flags=r;s,^,<%= compress.osx64.dest %>,'"
				+ " *"
		].join( " && " )
	}
};
