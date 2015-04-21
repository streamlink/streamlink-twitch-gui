define( [ "ember" ], function( Ember ) {

	var get = Ember.get;

	var reSubstitution = /\{([a-z]+)}/ig;
	var reEscape       = /(["'`$\\])/g;
	var strEscape      = "\\$1";
	var reWhitespace   = /\s+/g;


	/**
	 * @class Substitution
	 * @param {(string|string[])} vars
	 * @param {string} path
	 * @constructor
	 */
	function Substitution( vars, path ) {
		this.vars = Ember.makeArray( vars );
		this.path = path;
	}

	/**
	 * @param {string} name
	 * @returns {boolean}
	 */
	Substitution.prototype.hasVar = function( name ) {
		return this.vars.indexOf( name ) !== -1;
	};

	/**
	 * @param {Object} obj
	 * @returns {(string|boolean)}
	 */
	Substitution.prototype.getValue = function( obj ) {
		var val = get( obj, this.path );
		if ( val === undefined ) {
			return false;
		}

		return String( val )
			// escape special characters
			.replace( reEscape, strEscape )
			// remove whitespace
			.replace( reWhitespace, " " )
			.trim();
	};

	/**
	 * Apply multiple substituions at once.
	 * @param {string} str
	 * @param {(Substitution|Substitution[])} substitutions
	 * @param {Object} obj
	 */
	Substitution.substitute = function( str, substitutions, obj ) {
		substitutions = Ember.makeArray( substitutions );

		return str.replace( reSubstitution, function( all, name ) {
			name = name.toLowerCase();

			var res = false;
			// find the first matching variable and get its value
			substitutions.some(function( substitution ) {
				if ( substitution.hasVar( name ) ) {
					res = substitution.getValue( obj );
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
