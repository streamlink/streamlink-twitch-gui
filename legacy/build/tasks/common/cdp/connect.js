const CDP = require( "chrome-remote-interface" );
const retry = require( "./retry" );


module.exports = async function( options, logger = null ) {
	const { host, port } = options;

	// select the testrunner page
	const target = targets => {
		if ( !targets || !targets.length ) {
			throw new Error( "No targets" );
		}

		const index = targets.findIndex( ({ url }) => url.endsWith( "/index.html" ) );
		if ( index < 0 ) {
			throw new Error(
				`No matching target:\n${targets.map( t => `  ${t.url}` ).join( "\n" )}\n`
			);
		}

		return index;
	};

	const connect = () => CDP({ host, port, target });
	const cdp = await retry( options.connectAttempts, options.connectDelay, connect, logger );

	await cdp.send( "Runtime.enable" );

	return cdp;
};
