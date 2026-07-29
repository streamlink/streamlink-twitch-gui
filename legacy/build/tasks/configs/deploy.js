module.exports = {
	options: {
		changelogFile: "<%= dir.root %>/CHANGELOG.md"
	},
	github: {
		options: {
			apikey: process.env[ "RELEASES_API_KEY" ],
			repo: process.env[ "GITHUB_REPOSITORY" ],
			tag_name: ( process.env[ "GITHUB_REF" ] || "" )
				.replace( /^(?!refs\/tags\/).+$/, "" )
				.replace( /^refs\/tags\//, "" ),
			body: "<%= dir.root %>/.github/release_template.md",
			template: {
				display_name: "<%= main['display-name'] %>",
				version: "<%= package.version %>",
				homepage: "<%= package.homepage %>",
				donation: "<%= JSON.stringify( main['donation'] ) %>"
			}
		},
		src: "<%= dir.dist %>/*{.tar.gz,.zip,.exe,.AppImage,-checksums.txt}"
	}
};
