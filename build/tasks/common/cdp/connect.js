const CDP = require( "chrome-remote-interface" );
const retry = require( "./retry" );


module.exports = async function( options ) {
	const { host, port } = options;

	const connect = () => CDP({ host, port });
	const cdp = await retry( options.connectAttempts, options.connectDelay, connect );

	await cdp.send( "Runtime.enable" );

	return cdp;
};
