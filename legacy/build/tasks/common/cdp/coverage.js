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
			if ( !data ) {
				throw "No data returned";
			} else if ( data.error ) {
				throw data.error;
			} else if ( !data.result || data.result.type !== "string" || !data.result.value ) {
				throw "Missing result data";
			}
			data = JSON.parse( data.result.value );
		} catch ( err ) {
			throw new Error( `Could not read coverage report: ${err}` );
		} finally {
			clearTimeout( timeout );
		}

		return data;
	}

	async function processCoverage( report ) {
		grunt.log.ok( "Processing coverage data..." );

		const dir = grunt.config( "dir.tmp_coverage" );
		const watermarks = grunt.config( "coverage.watermarks" );
		const reporters = grunt.config( "coverage.reporters" );

		const libCoverage = require( "istanbul-lib-coverage" );
		const libReport = require( "istanbul-lib-report" );
		const libSourceMaps = require( "istanbul-lib-source-maps" );
		const reports = require( "istanbul-reports" );

		// https://github.com/istanbuljs/nyc/blob/v15.0.0/index.js#L410-L417
		const coverageMap = libCoverage.createCoverageMap( report );
		// https://github.com/istanbuljs/nyc/blob/v15.0.0/lib/source-maps.js#L49-L54
		const sourceMapCache = libSourceMaps.createSourceMapStore();
		const transformed = await sourceMapCache.transformCoverage(
			libCoverage.createCoverageMap( coverageMap.data )
		);
		coverageMap.data = transformed.data;
		// https://github.com/istanbuljs/nyc/blob/v15.0.0/index.js#L434-L447
		const context = libReport.createContext({ dir, watermarks, coverageMap });
		reporters.forEach( ({ name, options }) => {
			reports.create( name, options ).execute( context );
			grunt.log.ok( `Coverage reporter run: ${name}` );
		});
	}


	grunt.log.writeln( "" );
	const data = await getCoverage();
	await processCoverage( data );
};
