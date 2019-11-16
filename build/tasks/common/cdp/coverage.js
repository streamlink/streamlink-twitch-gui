const retry = require( "./retry" );


module.exports = async function( grunt, options, cdp ) {
	const expression = "JSON.stringify(window.__coverage__)";

	async function getCoverage() {
		grunt.log.ok( "Attempting to read coverage data..." );

		const timeout = setTimeout( () => {
			throw new Error( "Coverage read timeout" );
		}, options.coverageTimeout );

		let data;
		try {
			data = await cdp.send( "Runtime.evaluate", { expression } );
			if ( !data || !data.result || data.result.type !== "string" || !data.result.value ) {
				throw new Error();
			}
			data = JSON.parse( data.result.value );
		} catch ( e ) {
			throw new Error( "Could not read coverage report" );
		} finally {
			clearTimeout( timeout );
		}

		return data;
	}

	function processCoverage( report ) {
		grunt.log.ok( "Processing coverage data..." );

		const dir = grunt.config( "dir.tmp_coverage" );
		const watermarks = grunt.config( "coverage.watermarks" );
		const reporters = grunt.config( "coverage.reporters" );

		const libCoverage = require( "istanbul-lib-coverage" );
		const libReport = require( "istanbul-lib-report" );
		const libSourceMaps = require( "istanbul-lib-source-maps" );
		const reports = require( "istanbul-reports" );

		const map = libCoverage.createCoverageMap( report );
		const sourceMapCache = libSourceMaps.createSourceMapStore();
		map.data = sourceMapCache.transformCoverage(
			libCoverage.createCoverageMap( map.data )
		).map.data;
		const tree = libReport.summarizers.pkg( map );
		const context = libReport.createContext({ dir, watermarks });

		reporters.forEach( ({ name, options }) => {
			const report = reports.create( name, options );
			tree.visit( report, context );
			grunt.log.ok( `Coverage reporter run: ${name}` );
		});
	}


	grunt.log.writeln( "" );
	const data = await retry( options.coverageAttempts, options.coverageDelay, getCoverage );

	processCoverage( data );
};
