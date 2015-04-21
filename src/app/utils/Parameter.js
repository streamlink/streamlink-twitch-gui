define( [ "ember", "utils/Substitution" ], function( Ember, Substitution ) {

	var get = Ember.get;
	var push = [].push;

	/**
	 * @class Parameter
	 * @param {string} name
	 * @param {(string|Function)?} cond
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
			: Ember.makeArray( cond ).concat( value || [] ).map(function( prop ) {
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
			return cond.call( obj );
		});
	};

	/**
	 * @param {Object} obj
	 * @param {Substitution[]} substitutions
	 * @returns {(string|boolean)}
	 */
	Parameter.prototype.getValue = function( obj, substitutions ) {
		if ( this.value === undefined ) { return false; }

		var value = String( get( obj, this.value ) );
		return this.subst && substitutions
			? Substitution.substitute( value, substitutions, obj )
			: value;
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
				push.call( arr, parameter.name );

				var value = parameter.getValue( obj, substitutions );
				if ( value !== false && value.length ) {
					push.call( arr, value );
				}

				return arr;
			}, [] );
	};

	return Parameter;

});
