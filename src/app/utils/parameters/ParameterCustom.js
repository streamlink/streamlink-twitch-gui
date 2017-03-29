import Parameter from "utils/parameters/Parameter";


const reBackslash = /^\\$/;
const reSpace     = /^ $/;
const reQuote     = /^["']$/;

const listEscaped = "\\'\"".split( "" );


/**
 * @class ParameterCustom
 * @extends Parameter
 */
export default class ParameterCustom extends Parameter {
	/**
	 * @param {(String|String[]|Function)?} cond
	 * @param {String?} value
	 * @param {Substitution[]?} subst
	 */
	constructor( cond, value, subst ) {
		super( undefined, cond, value, subst );
	}

	/**
	 * @param {Object} context
	 * @returns {String[]}
	 */
	get( context ) {
		let value = this.getValue( context );

		return value === false
			? []
			: this.tokenize( value );
	}

	/**
	 * Tokenize a parameter string
	 * @param {String} str
	 * @returns {String[]}
	 */
	tokenize( str ) {
		let output  = [];
		let buffer  = "";
		let quoted  = false;
		let escaped = false;

		// add buffer to output and reset
		function clearBuffer() {
			if ( buffer.length ) {
				output.push( buffer );
				buffer = "";
			}
		}

		for ( let char, i = 0, l = str.length; i < l; i++ ) {
			char = str.charAt( i );

			// in escaped mode?
			if ( escaped !== false ) {
				// is character no valid escapable character?
				if ( listEscaped.indexOf( char ) === -1 ) {
					// add backslash to buffer and go on
					buffer += escaped;
					escaped = false;
				}

				// is character a backslash and not in escaped mode?
			} else if ( reBackslash.test( char ) ) {
				// set escaped mode and continue with next char
				escaped = char;
				continue;
			}

			// is it a space character?
			if ( reSpace.test( char ) ) {
				// currently quoted?
				if ( quoted !== false ) {
					// add space character to buffer
					buffer += char;

				} else {
					clearBuffer();
				}

				// is it a quotation mark and not in escaped mode?
			} else if ( escaped === false && reQuote.test( char ) ) {
				// in quotation mode and using the same quotation mark?
				if ( quoted === char ) {
					clearBuffer();
					// reset quotation mode
					quoted = false;

					// in quotation mode and using a different quotation mark?
				} else if ( quoted !== false ) {
					// just add the different quotation mark to buffer
					buffer += char;

					// not in quotation mode?
				} else {
					clearBuffer();
					// set quotation mode
					quoted = char;
				}

				// character is not a space or quotation mark
			} else {
				buffer += char;
			}

			// reset escaped mode
			escaped = false;
		}

		// add final buffer to output
		if ( buffer.length ) {
			// prepend quotation mark if still in quotation mode
			if ( quoted !== false ) {
				buffer = quoted + buffer;
			}
			// append backslash to buffer if still in escaped mode
			if ( escaped !== false ) {
				buffer += escaped;
			}
			clearBuffer();
		}

		return output;
	}
}
