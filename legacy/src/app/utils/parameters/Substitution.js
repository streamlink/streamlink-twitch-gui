import { makeArray } from "@ember/array";
import { get } from "@ember/object";


const reSubstitution = /(\{)?\{([a-z]+)}(})?/ig;
const reCurly        = /[{}]/ig;
const reWhitespace   = /\s+/g;
const reQuote        = /^['"]$/;
const reDoubleQuote  = /"|\\$/g;
const reSingleQuote  = /'|\\$/g;
const reAll          = /./g;
const strEscape      = "\\";


function fnCurly( str ) {
	return `${str}${str}`;
}

function fnEscape( str ) {
	return `${strEscape}${str}`;
}


class SubstitutionToken {
	/**
	 * @param {String} string
	 */
	constructor( string ) {
		this.string = string;
	}

	/**
	 * @param {Function} fn
	 * @return {String}
	 */
	substituteVariables( fn ) {
		return this.string.replace( reSubstitution, fn );
	}

	/**
	 * @param {String} string
	 * @returns {String}
	 */
	escape( string ) {
		return String( string )
			// add double curlies
			.replace( reCurly, fnCurly )
			// escape characters
			.replace( this.regexp, fnEscape );
	}
}

class SubstitutionTokenSingleQuote extends SubstitutionToken {}
SubstitutionTokenSingleQuote.prototype.regexp = reSingleQuote;

class SubstitutionTokenDoubleQuote extends SubstitutionToken {}
SubstitutionTokenDoubleQuote.prototype.regexp = reDoubleQuote;

class SubstitutionTokenNoQuote extends SubstitutionToken {}
SubstitutionTokenNoQuote.prototype.regexp = reAll;


const tokenQuoteMap = {
	"'": SubstitutionTokenSingleQuote,
	"\"": SubstitutionTokenDoubleQuote
};


/**
 * @class Substitution
 */
export default class Substitution {
	/**
	 * @param {(String|String[])} vars
	 * @param {String} path
	 * @param {String?} description
	 */
	constructor( vars, path, description ) {
		this.vars = makeArray( vars );
		this.path = path;
		this.description = description;
	}

	/**
	 * @param {String} name
	 * @returns {Boolean}
	 */
	hasVar( name ) {
		return this.vars.indexOf( name ) !== -1;
	}

	/**
	 * @param {Object} context
	 * @returns {(String|Boolean)}
	 */
	getValue( context ) {
		let val = get( context, this.path );
		if ( val === undefined ) {
			return false;
		}

		// remove whitespace
		return String( val ).trim().replace( reWhitespace, " " );
	}


	/**
	 * Apply multiple substituions at once.
	 * @param {Object} context
	 * @param {(Substitution|Substitution[])} substitutions
	 * @param {String} str
	 * @param {Boolean?} escape
	 * @return {String}
	 */
	static substitute( context, substitutions, str, escape ) {
		substitutions = makeArray( substitutions );

		// tokenize string (search for strings)
		return Substitution.tokenize( String( str ) )
			// and reduce token array back to a string
			.reduce( ( result, token ) => {
				// search for variables in each token independently
				result.push( token.substituteVariables( ( all, left, name, right ) => {
					// ignore double curly bracket vars
					if ( left ) { return all; }

					// var names are case independent
					name = name.toLowerCase();

					let res = false;
					// find the first matching variable and get its value
					substitutions.every( substitution => {
						if ( !substitution.hasVar( name ) ) { return true; }

						res = substitution.getValue( context );
						if ( escape && res !== false ) {
							// escape the variable's content
							res = token.escape( res );
						}
					});

					return res === false
						? all
						: `${res}${right || ""}`;
				}) );

				return result;
			}, [] )
			.join( "" );
	}

	/**
	 * Tokenize a string
	 * @param {String} str
	 * @returns {SubstitutionToken[]}
	 */
	static tokenize( str ) {
		let output  = [];
		let buffer  = "";
		let escaped = false;
		let quote   = false;

		function clearBuffer() {
			if ( !buffer.length ) { return; }
			let Token = quote && tokenQuoteMap[ quote ] || SubstitutionTokenNoQuote;
			output.push( new Token( buffer ) );
			buffer = "";
			quote = false;
		}

		// tokenize string
		for ( let char, i = 0, l = str.length; i < l; i++ ) {
			char = str.charAt( i );

			// detect escaped characters
			if ( escaped ) {
				buffer += strEscape + char;
				escaped = false;
				continue;
			} else if ( char === strEscape ) {
				escaped = true;
				continue;
			}

			// detect quoted strings
			if ( reQuote.test( char ) ) {
				// not in quoted mode
				if ( !quote ) {
					clearBuffer();
					buffer += char;
					quote = char;
					continue;

					// closing quotation mark
				} else if ( char === quote ) {
					buffer += char;
					clearBuffer();
					continue;
				}
			}

			// add char to buffer
			buffer += char;
		}

		if ( buffer.length ) {
			if ( escaped ) {
				buffer += strEscape;
			}
			clearBuffer();
		}

		return output;
	}
}
