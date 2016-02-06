/*!
 * Based on
 * https://github.com/joliss/js-string-escape
 * Copyright (c) 2013 Jo Liss
 * @license MIT
 */
define(function() {

	var r = /["'\\\n\r\u2028\u2029]/g;

	function escape( s ) {
		return String( s ).replace( r, function( c ) {
			// Escape all characters not included in SingleStringCharacters and
			// DoubleStringCharacters on
			// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
			switch ( c ) {
				case "\"":
				case "'":
				case "\\":
					return "\\" + c;
				// Four possible LineTerminator characters need to be escaped:
				case "\n":
					return "\\n";
				case "\r":
					return "\\r";
				case "\u2028":
					return "\\u2028";
				case "\u2029":
					return "\\u2029";
			}
		});
	}


	return escape;

});
