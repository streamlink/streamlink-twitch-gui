const reUrl = /^(?:https?:\/\/)?(?:(?:www|secure|go)\.)?twitch\.tv\/(\w+)(?:\/profile)?$/;
const blacklist = [ "directory", "login", "signup", "logout", "settings" ];


/**
 * @param {String} url
 * @returns {(Boolean|String)}
 */
function getStreamFromUrl( url ) {
	const match = reUrl.exec( String( url ) );

	if ( !match ) {
		return false;
	}

	return blacklist.indexOf( match[ 1 ] ) === -1
		? match[ 1 ]
		: false;
}


export default getStreamFromUrl;
