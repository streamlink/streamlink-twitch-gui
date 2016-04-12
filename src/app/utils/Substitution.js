define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;
	var makeArray = Ember.makeArray;

	var reSubstitution = /\{([a-z]+)}/ig;

	var reEscape       = /(["'`$\\])/g;
	var strEscape      = "\\$1";

	var reDouble       = /([\{}])/g;
	var strDouble      = "$1$1";

	var reWhitespace   = /\s+/g;


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

		return String( val )
			// escape special characters
			.replace( reEscape, strEscape )
			// escape curly brackets
			.replace( reDouble, strDouble )
			// remove whitespace
			.replace( reWhitespace, " " )
			.trim();
	};

	/**
	 * Apply multiple substituions at once.
	 * @param {Object} context
	 * @param {(Substitution|Substitution[])} substitutions
	 * @param {string} str
	 */
	Substitution.substitute = function( context, substitutions, str ) {
		substitutions = makeArray( substitutions );

		return str.replace( reSubstitution, function( all, name ) {
			name = name.toLowerCase();

			var res = false;
			// find the first matching variable and get its value
			substitutions.some(function( substitution ) {
				if ( substitution.hasVar( name ) ) {
					res = substitution.getValue( context );
					return true;
				}
			});

			return res === false
				? all
				: res;
		});
	};


	return Substitution;

});
