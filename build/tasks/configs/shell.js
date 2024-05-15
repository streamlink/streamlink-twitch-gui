module.exports = {
	permissions_osx64: {
		command: [
			"cd '<%= dir.releases %>/<%= package.name %>/osx64'",
			"find . -type f -print0 | xargs -0 chmod -R g=u,o=u,g-w,o-w"
		].join( " && " )
	},
	permissions_linux32: {
		command: [
			"cd '<%= dir.releases %>/<%= package.name %>/linux32'",
			"find . -type f -print0 | xargs -0 chmod -R g=u,o=u,g-w,o-w"
		].join( " && " )
	},
	permissions_linux64: {
		command: [
			"cd '<%= dir.releases %>/<%= package.name %>/linux64'",
			"find . -type f -print0 | xargs -0 chmod -R g=u,o=u,g-w,o-w"
		].join( " && " )
	},

	wrapper_linux32: {
		command: [
			"cd '<%= dir.releases %>/<%= package.name %>/linux32'",
			"mv '<%= package.name %>' '_<%= package.name %>'",
			"mv start.sh '<%= package.name %>'"
		].join( " && " )
	},
	wrapper_linux64: {
		command: [
			"cd '<%= dir.releases %>/<%= package.name %>/linux64'",
			"mv '<%= package.name %>' '_<%= package.name %>'",
			"mv start.sh '<%= package.name %>'"
		].join( " && " )
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

	archive_win32: {
		command: [
			"bash '<%= dir.resources %>/archive/zip.sh'",
			"'<%= compress.win32.input %>'",
			"'<%= compress.win32.output %>'",
			"'<%= compress.win32.prefix %>'"
		].join( " " )
	},
	archive_win64: {
		command: [
			"bash '<%= dir.resources %>/archive/zip.sh'",
			"'<%= compress.win64.input %>'",
			"'<%= compress.win64.output %>'",
			"'<%= compress.win64.prefix %>'"
		].join( " " )
	},
	archive_osx64: {
		command: [
			"bash '<%= dir.resources %>/archive/tar-gzip.sh'",
			"'<%= compress.osx64.input %>'",
			"'<%= compress.osx64.output %>'",
			"'<%= compress.osx64.prefix %>'"
		].join( " " )
	},
	archive_linux32: {
		command: [
			"bash '<%= dir.resources %>/archive/tar-gzip.sh'",
			"'<%= compress.linux32.input %>'",
			"'<%= compress.linux32.output %>'",
			"'<%= compress.linux32.prefix %>'"
		].join( " " )
	},
	archive_linux64: {
		command: [
			"bash '<%= dir.resources %>/archive/tar-gzip.sh'",
			"'<%= compress.linux64.input %>'",
			"'<%= compress.linux64.output %>'",
			"'<%= compress.linux64.prefix %>'"
		].join( " " )
	},

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
	},

	appimage_linux32: {
		command: [
			"bash '<%= dir.resources %>/appimage/build.sh'",
			"'<%= package.name %>'",
			"'<%= version %>'",
			"'<%= appimage.linux32.image %>'",
			"'<%= appimage.linux32.digest %>'",
			"'<%= appimage.linux32.input %>'",
			"'<%= appimage.linux32.output %>'",
			"<%= appimage.linux32.dependencies.map(d=>`'${d}'`).join(' ') %>"
		].join( " " )
	},
	appimage_linux64: {
		command: [
			"bash '<%= dir.resources %>/appimage/build.sh'",
			"'<%= package.name %>'",
			"'<%= version %>'",
			"'<%= appimage.linux64.image %>'",
			"'<%= appimage.linux64.digest %>'",
			"'<%= appimage.linux64.input %>'",
			"'<%= appimage.linux64.output %>'",
			"<%= appimage.linux64.dependencies.map(d=>`'${d}'`).join(' ') %>"
		].join( " " )
	},

	appimage_dependencies_linux32: {
		command: [
			"bash '<%= dir.resources %>/appimage/get-dependencies.sh'",
			"'<%= appimage.linux32.image %>'",
			"'<%= appimage.linux32.digest %>'",
			"'<%= appimage.linux32.input %>'"
		].join( " " )
	},
	appimage_dependencies_linux64: {
		command: [
			"bash '<%= dir.resources %>/appimage/get-dependencies.sh'",
			"'<%= appimage.linux64.image %>'",
			"'<%= appimage.linux64.digest %>'",
			"'<%= appimage.linux64.input %>'"
		].join( " " )
	}
};
