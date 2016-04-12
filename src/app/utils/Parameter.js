define([
	"Ember",
	"utils/Substitution"
], function(
	Ember,
	Substitution
) {

	var get = Ember.get;
	var makeArray = Ember.makeArray;
	var isNone = Ember.isNone;
	var push = [].push;


	/**
	 * @class Parameter
	 * @param {string?} name
	 * @param {(string|string[]|Function)?} cond
	 * @param {string?} value
	 * @param {Substitution[]?} subst
	 * @constructor
	 */
	function Parameter( name, cond, value, subst ) {
		this.name  = name;
		this.value = value;
		this.subst = subst;
		this.cond  = cond instanceof Function
			? [ cond ]
			: makeArray( cond ).concat( value || [] ).map(function( prop ) {
				return prop instanceof Function
					? prop
					: function() {
						return !!get( this, prop );
					};
			});
	}

	/**
	 * @param {Object} context
	 * @returns {boolean}
	 */
	Parameter.prototype.validate = function( context ) {
		return this.cond.every(function( cond ) {
			// cond may be bound to something else
			return cond.call( context, context );
		});
	};

	/**
	 * @param {Object} context
	 * @param {boolean} advanced
	 * @returns {(string|boolean)}
	 */
	Parameter.prototype.getValue = function( context, advanced ) {
		if ( isNone( this.value ) ) { return false; }

		var value = String( get( context, this.value ) );
		return advanced && this.subst
			? Substitution.substitute( context, this.subst, value )
			: value;
	};

	/**
	 * @param {Object} context
	 * @param {boolean} advanced
	 * @returns {string[]}
	 */
	Parameter.prototype.get = function( context, advanced ) {
		var res = [];

		if ( !isNone( this.name ) ) {
			res.push( this.name );
		}

		var value = this.getValue( context, advanced );
		if ( value !== false && value.length ) {
			push.call( res, value );
		}

		return res;
	};


	/**
	 * Turn an array of parameters into an array of strings in context of an object
	 * @param {Object} context
	 * @param {Parameter[]} parameters
	 * @param {boolean?} advanced
	 * @returns {string[]}
	 */
	Parameter.getParameters = function( context, parameters, advanced ) {
		return parameters
			// a parameter must fulfill every condition
			.filter(function( parameter ) {
				return parameter.validate( context );
			})
			// return a list of each parameter's name and its (substituted) value
			.reduce(function( arr, parameter ) {
				var params = parameter.get( context, advanced );
				push.apply( arr, makeArray( params ) );

				return arr;
			}, [] );
	};


	return Parameter;

});
