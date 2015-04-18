module.exports = {
	"chocolatey" : {
		"options" : {
			"data" : {
				"author": "<%= package.author %>",
				"homepage": "<%= package.homepage %>",
				"name": "<%= package.name %>",
				"releaseNotes": "<%= releaseNotes %>",
				"version": "<%= package.version %>"
			}
		},
		"files": {
			"build/package/chocolatey/livestreamer-twitch-gui.nuspec":
				["build/resources/package/chocolatey/livestreamer-twitch-gui.nuspec.tpl"],
			"build/package/chocolatey/tools/chocolateyinstall.ps1":
				["build/resources/package/chocolatey/tools/chocolateyinstall.ps1.tpl"],
			"build/package/chocolatey/tools/chocolateyuninstall.ps1":
				["build/resources/package/chocolatey/tools/chocolateyuninstall.ps1.tpl"]
		}
	}
};
