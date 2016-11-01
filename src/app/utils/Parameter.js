import {
	get,
	isNone,
	makeArray
} from "Ember";
import Substitution from "utils/Substitution";


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
 * @returns {(string|boolean)}
 */
Parameter.prototype.getValue = function( context ) {
	if ( isNone( this.value ) ) { return false; }

	let value = String( get( context, this.value ) );
	return this.subst
		? Substitution.substitute( context, this.subst, value, true )
		: value;
};

/**
 * @param {Object} context
 * @returns {string[]}
 */
Parameter.prototype.get = function( context ) {
	let res = [];

	if ( !isNone( this.name ) ) {
		res.push( this.name );
	}

	let value = this.getValue( context );
	if ( value !== false && value.length ) {
		res.push( value );
	}

	return res;
};


/**
 * Turn an array of parameters into an array of strings in context of an object
 * @param {Object} context
 * @param {Parameter[]} parameters
 * @returns {string[]}
 */
Parameter.getParameters = function( context, parameters ) {
	return parameters
		// a parameter must fulfill every condition
		.filter(function( parameter ) {
			return parameter.validate( context );
		})
		// return a list of each parameter's name and its (substituted) value
		.reduce(function( arr, parameter ) {
			let params = parameter.get( context );
			arr.push( ...makeArray( params ) );

			return arr;
		}, [] );
};


export default Parameter;
