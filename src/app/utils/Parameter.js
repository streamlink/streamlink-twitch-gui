define( [ "ember", "utils/Substitution" ], function( Ember, Substitution ) {

	var get = Ember.get;
	var makeArray = Ember.makeArray;
	var isNone = Ember.isNone;
	var push = [].push;

	/**
	 * @class Parameter
	 * @param {string?} name
	 * @param {(string|string[]|Function)?} cond
	 * @param {string?} value
	 * @param {boolean?} subst
	 * @constructor
	 */
	function Parameter( name, cond, value, subst ) {
		this.name  = name;
		this.value = value;
		this.subst = !!subst;
		this.cond  = cond instanceof Function
			? [ cond ]
			: makeArray( cond ).concat( value || [] ).map(function( prop ) {
				return function() {
					return !!get( this, prop );
				};
			});
	}

	/**
	 * @param {Object} obj
	 * @returns {boolean}
	 */
	Parameter.prototype.validate = function( obj ) {
		return this.cond.every(function( cond ) {
			// cond may be bound to something else
			return cond.call( obj, obj );
		});
	};

	/**
	 * @param {Object} obj
	 * @param {Substitution[]?} substitutions
	 * @returns {(string|boolean)}
	 */
	Parameter.prototype.getValue = function( obj, substitutions ) {
		if ( isNone( this.value ) ) { return false; }

		var value = String( get( obj, this.value ) );
		return this.subst && substitutions
			? Substitution.substitute( value, substitutions, obj )
			: value;
	};

	/**
	 * @param {Object} obj
	 * @param {Substitution[]} substitutions
	 * @returns {string[]}
	 */
	Parameter.prototype.get = function( obj, substitutions ) {
		var res = [];

		if ( !isNone( this.name ) ) {
			res.push( this.name );
		}

		var value = this.getValue( obj, substitutions );
		if ( value !== false && value.length ) {
			push.call( res, value );
		}

		return res;
	};

	/**
	 * @param {Object} obj
	 * @param {Parameter[]} parameters
	 * @param {Substitution[]?} substitutions
	 * @returns {string[]}
	 */
	Parameter.getParameters = function( obj, parameters, substitutions ) {
		return parameters
			// a parameter must fulfill every condition
			.filter(function( parameter ) {
				return parameter.validate( obj );
			})
			// return a list of each parameter's name and its (substituted) value
			.reduce(function( arr, parameter ) {
				var params = parameter.get( obj, substitutions );
				push.apply( arr, makeArray( params ) );

				return arr;
			}, [] );
	};

	return Parameter;

});
