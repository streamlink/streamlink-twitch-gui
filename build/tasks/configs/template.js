module.exports = {
	"chocolatey" : {
		"options" : {
			"data" : {
				"author": "<%= package.author %>",
				"changelog": "<%= package.changelogEscaped %>",
				"checksum": "<%= package.checksums.win32.hash %>",
				"checksum64": "<%= package.checksums.win64.hash %>",
				"homepage": "<%= package.homepage %>",
				"id": "<%= package.name %>",
				"title": "<%= main['display-name'] %>",
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
	},

	"win32installer": {
		"options": {
			"data": {
				"dirroot"    : "<%= dir.root %>",
				"dirinput"   : "<%= dir.releases %>/<%= package.name %>/win32",
				"diroutput"  : "<%= dir.dist %>",
				"filename"   : "<%= package.name %>-v<%= package.version %>-win32-installer.exe",
				"name"       : "<%= package.name %>",
				"displayname": "<%= main['display-name'] %>",
				"version"    : "<%= package.version %>",
				"author"     : "<%= package.author %>",
				"homepage"   : "<%= package.homepage %>",
				"arch"       : "win32"
			}
		},
		"files": {
			"<%= dir.package %>/win32installer/installer.nsi":
				"<%= dir.resources %>/package/wininstaller/installer.nsi.tpl"
		}
	},

	"win64installer": {
		"options": {
			"data": {
				"dirroot"    : "<%= dir.root %>",
				"dirinput"   : "<%= dir.releases %>/<%= package.name %>/win64",
				"diroutput"  : "<%= dir.dist %>",
				"filename"   : "<%= package.name %>-v<%= package.version %>-win64-installer.exe",
				"name"       : "<%= package.name %>",
				"displayname": "<%= main['display-name'] %>",
				"version"    : "<%= package.version %>",
				"author"     : "<%= package.author %>",
				"homepage"   : "<%= package.homepage %>",
				"arch"       : "win64"
			}
		},
		"files": {
			"<%= dir.package %>/win64installer/installer.nsi":
				"<%= dir.resources %>/package/wininstaller/installer.nsi.tpl"
		}
	}
};
