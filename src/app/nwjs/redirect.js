define( [ "nwjs/nwGui" ], function( nwGui ) {

	var reURI = /^([a-z]+):\/\/([\w-]+(?:\.[\w-]+)*)\/?/;

	var enabled = {};

	/**
	 * @param {string} from
	 * @param {string} to
	 */
	function enable( from, to ) {
		var src = reURI.exec( from );
		var dst = reURI.exec( to );

		if ( !src || !dst ) {
			throw new Error( "Invalid parameters" );
		}

		if ( enabled.hasOwnProperty( from ) ) {
			if ( enabled[ from ].hasOwnProperty( to ) ) {
				return;
			}
		} else {
			enabled[ from ] = {};
		}
		enabled[ from ][ to ] = true;

		nwGui.App.addOriginAccessWhitelistEntry( src[0], dst[1], dst[2], true );
	}

	return {
		enable: enable
	};

});
