const CDP = require( "chrome-remote-interface" );
const retry = require( "./retry" );


module.exports = async function( options ) {
	const { host, port } = options;

	// select the testrunner page
	const target = targets => targets.findIndex( ({ url }) => url.endsWith( "/index.html" ) );

	const connect = () => CDP({ host, port, target });
	const cdp = await retry( options.connectAttempts, options.connectDelay, connect );

	await cdp.send( "Runtime.enable" );

	return cdp;
};
