const merge = require( "lodash/merge" );
const getReleaseChangelog = require( "../common/release-changelog" );


module.exports = function( grunt ) {
	grunt.registerMultiTask( "deploy", "Deploy built release", function() {
		let deployTarget;
		switch ( this.target ) {
			case "github":
				deployTarget = require( "../common/deploy/github" );
				break;
			default:
				grunt.fail.fatal( "Invalid deploy target" );
		}

		const done = this.async();
		const dryRun = this.args.includes( "dry_run" );

		const options = this.options();
		const files = this.filesSrc;
		const version = grunt.config( "package.version" );

		getReleaseChangelog( options.changelogFile, version )
			.then( changelog => {
				const opts = merge( {}, options, { template: { changelog } } );

				return deployTarget( grunt, files, opts, dryRun );
			})
			.then( done, grunt.fail.fatal );
	});
};
