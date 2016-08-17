var HTTP = require( "http" );
var HTTPS = require( "https" );
var parseUrl = require( "url" ).parse;


/**
 * Download a file via https (default) or http and support redirects
 * @param {Object} request
 * @param {stream.Writable?} stream
 * @returns {Promise<String>}
 */
function download( request, stream ) {
	if ( typeof request === "string" ) {
		request = parseUrl( request );
	}

	if ( !request.headers ) {
		request.headers = {};
	}
	request.headers[ "user-agent" ] = "Mozilla/5.0";

	return new Promise(function( resolve, reject ) {
		( request.protocol === "http:" ? HTTP : HTTPS ).get( request, function( response ) {
			// redirect
			if (
				   response.statusCode >= 300
				&& response.statusCode < 400
				&& response.headers.hasOwnProperty( "location" )
			) {
				return download( response.headers[ "location" ] ).then( resolve, reject );
			}

			if ( stream ) {
				response.pipe( stream );
				response.on( "end", resolve );

			} else {
				var data = [];
				response.on( "data", function( chunk ) {
					data.push( chunk );
				});
				response.on( "end", function() {
					resolve( Buffer.concat( data ).toString() );
				});
			}
		}).on( "error", reject );
	});
}


module.exports = download;
