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
			"<%= dir.package %>/chocolatey/streamlink-twitch-gui.nuspec":
				"<%= dir.resources %>/package/chocolatey/streamlink-twitch-gui.nuspec.tpl",
			"<%= dir.package %>/chocolatey/tools/chocolateyinstall.ps1":
				"<%= dir.resources %>/package/chocolatey/tools/chocolateyinstall.ps1.tpl",
			"<%= dir.package %>/chocolatey/tools/chocolateyuninstall.ps1":
				"<%= dir.resources %>/package/chocolatey/tools/chocolateyuninstall.ps1.tpl"
		}
	},

	"releases": {
		"options": {
			"data": {
				"display_name": "<%= main['display-name'] %>",
				"version": "<%= package.version %>",
				"homepage": "<%= package.homepage %>",
				"changelog": "<%= releases.changelog %>",
				"donation": JSON.parse( process.env.RELEASES_DONATION || "[]" ) || []
			}
		},
		"files": {
			"<%= dir.travis %>/data/releases.md": "<%= dir.travis %>/templates/releases.md"
		}
	}
};
