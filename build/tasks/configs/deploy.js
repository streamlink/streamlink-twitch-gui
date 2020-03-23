module.exports = {
	options: {
		changelogFile: "<%= dir.root %>/CHANGELOG.md"
	},
	github: {
		options: {
			apikey: process.env[ "RELEASES_API_KEY" ],
			repo: process.env[ "TRAVIS_REPO_SLUG" ],
			tag_name: process.env[ "TRAVIS_TAG" ],
			body: "<%= dir.root %>/.github/release_template.md",
			template: {
				display_name: "<%= main['display-name'] %>",
				version: "<%= package.version %>",
				homepage: "<%= package.homepage %>",
				donation: "<%= JSON.stringify( main['donation'] ) %>"
			}
		},
		src: "<%= dir.dist %>/*{.tar.gz,.zip,.exe,-checksums.txt}"
	}
};
