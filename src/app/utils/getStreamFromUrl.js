define(function() {

	var reUrl = /^(?:https?:\/\/)?(?:(?:www|secure)\.)?twitch\.tv\/(\w+)(?:\/profile)?$/;
	var blacklist = [ "directory", "login", "signup", "logout", "settings" ];


	/**
	 * @param {String} url
	 * @returns {(Boolean|String)}
	 */
	return function getStreamFromUrl( str ) {
		var match = reUrl.exec( String( str ) );

		if ( !match ) {
			return false;
		}

		return blacklist.indexOf( match[ 1 ] ) === -1
			? match[ 1 ]
			: false;
	};

});
