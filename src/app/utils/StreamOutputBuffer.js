var defDelimiter   = /\r\n|\r|\n/g;
var defMaxBuffSize = 4096;


/**
 * @param {Object?}       options
 * @param {string|RegExp} options.delimiter
 * @param {number?}       options.maxBuffSize
 * @param {Function}      callback
 * @param {Object?}       thisArg
 * @returns {StreamOutputBuffer}
 */
function StreamOutputBuffer( options, callback, thisArg ) {
	if ( !options || options instanceof Function ) {
		callback = options;
		options  = {};
	}

	var buffer      = "";
	var delimiter   = options.delimiter   || defDelimiter;
	var maxBuffSize = options.maxBuffSize || defMaxBuffSize;

	function StreamOutputBuffer( data ) {
		// don't exceed the buffer size limit
		if ( buffer.length + data.length > maxBuffSize ) {
			throw new Error( "Buffer size limit exceeded" );
		}

		// append output to buffer and split it
		var lines = ( buffer + String( data ) ).split( delimiter );
		// set the buffer to the remaining/incomplete line (or to an empty string)
		buffer = lines.pop();

		lines.forEach( callback, thisArg || null );
	}

	StreamOutputBuffer.getBuffer = function() {
		return buffer;
	};

	return StreamOutputBuffer;
}


// don't export as an es6 module (metadata-loader)
module.exports = StreamOutputBuffer;
