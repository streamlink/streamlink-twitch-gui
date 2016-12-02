var PATH = require( "path" );


module.exports = {
	options: {
		changelogFile: PATH.resolve( "CHANGELOG.md" ),
		// has a rate limit of 60 requests per IP per hour
		githubReleases: "https://api.github.com/repos/streamlink/streamlink-twitch-gui/releases",
		githubReleasesAtom: "https://github.com/streamlink/streamlink-twitch-gui/releases.atom"
	},

	chocolatey: {
		options: {
			changelog: true,
			checksums: true
		},
		tasks: [
			"clean:package_chocolatey",
			"template:chocolatey",
			"shell:chocolatey"
		]
	}
};
