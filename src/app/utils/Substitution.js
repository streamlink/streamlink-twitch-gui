define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;
	var makeArray = Ember.makeArray;

	var reSubstitution = /(\{)?\{([a-z]+)}(})?/ig;
	var reWhitespace   = /\s+/g;
	var reQuote        = /^['"]$/;
	var reDoubleQuote  = /"|\\$/g;
	var reSingleQuote  = /'|\\$/g;
	var reAll          = /./g;
	var strEscape      = "\\";

	function fnEscape( c ) {
		return strEscape + c;
	}


	/**
	 * @class Substitution
	 * @param {(string|string[])} vars
	 * @param {string} path
	 * @param {string?} description
	 * @constructor
	 */
	function Substitution( vars, path, description ) {
		this.vars = makeArray( vars );
		this.path = path;
		this.description = description;
	}

	/**
	 * @param {string} name
	 * @returns {boolean}
	 */
	Substitution.prototype.hasVar = function( name ) {
		return this.vars.indexOf( name ) !== -1;
	};

	/**
	 * @param {Object} context
	 * @returns {(string|boolean)}
	 */
	Substitution.prototype.getValue = function( context ) {
		var val = get( context, this.path );
		if ( val === undefined ) {
			return false;
		}

		// remove whitespace
		return String( val ).trim().replace( reWhitespace, " " );
	};


	/**
	 * Apply multiple substituions at once.
	 * @param {Object} context
	 * @param {(Substitution|Substitution[])} substitutions
	 * @param {string} str
	 * @param {boolean?} escape
	 */
	Substitution.substitute = function( context, substitutions, str, escape ) {
		substitutions = makeArray( substitutions );

		// tokenize string (search for strings)
		return Substitution.tokenize( String( str ) )
			// and reduce token array back to a string
			.reduce(function( result, token ) {
				// search for variables in each token independently
				token = token.string.replace( reSubstitution, function( all, left, name, right ) {
					// ignore double curly bracket vars
					if ( left ) { return all; }

					// var names are case independent
					name = name.toLowerCase();

					var res = false;
					// find the first matching variable and get its value
					substitutions.every(function( substitution ) {
						if ( !substitution.hasVar( name ) ) { return true; }

						res = substitution.getValue( context );
						if ( escape && res !== false ) {
							// escape the variable's content
							res = res.replace(
								token.quote === "\""
									? reDoubleQuote
									: token.quote === "\'"
										? reSingleQuote
										: reAll,
								fnEscape
							);
						}
					});

					return res === false
						? all
						: res + ( right || "" );
				});

				return result + token;
			}, "" );
	};


	/**
	 * Tokenize a string
	 * @param {string} str
	 * @returns {Array}
	 */
	Substitution.tokenize = function( str ) {
		var output  = [];
		var buffer  = "";
		var escaped = false;
		var quote   = false;

		function clearBuffer() {
			if ( !buffer.length ) { return; }
			output.push({
				string: buffer,
				quote : quote
			});
			buffer = "";
			quote = false;
		}

		// tokenize string
		for ( var char, i = 0, l = str.length; i < l; i++ ) {
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
	};


	return Substitution;

});
