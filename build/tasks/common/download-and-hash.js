var CRYPTO = require( "crypto" );
var download = require( "./download" );
var config = require( "../configs/checksum" ).options;


/**
 * @param {String} url
 * @param {Object?} options
 * @param {String?} options.algorithm
 * @param {String?} options.encoding
 * @returns {Promise<String>}
 */
function downloadAndHash( url, options ) {
	options = options || {};

	var hash = CRYPTO.createHash( options.algorithm || config.algorithm );
	hash.setEncoding( options.encoding || config.encoding );

	return download( url, hash )
		.then(function() {
			return hash.read();
		});
}


module.exports = downloadAndHash;
