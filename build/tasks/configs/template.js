module.exports = {
	"chocolatey" : {
		"options" : {
			"data" : {
				"author": "<%= package.author %>",
				"checksum": "<%= package.checksums.win32.hash %>",
				"checksum64": "<%= package.checksums.win64.hash %>",
				"homepage": "<%= package.homepage %>",
				"name": "<%= package.name %>",
				"changelog": "<%= package.changelogEscaped %>",
				"version": "<%= package.version %>"
			}
		},
		"files": {
			"<%= dir.package %>/chocolatey/livestreamer-twitch-gui.nuspec":
				"<%= dir.resources %>/package/chocolatey/livestreamer-twitch-gui.nuspec.tpl",
			"<%= dir.package %>/chocolatey/tools/chocolateyinstall.ps1":
				"<%= dir.resources %>/package/chocolatey/tools/chocolateyinstall.ps1.tpl",
			"<%= dir.package %>/chocolatey/tools/chocolateyuninstall.ps1":
				"<%= dir.resources %>/package/chocolatey/tools/chocolateyuninstall.ps1.tpl"
		}
	}
};
