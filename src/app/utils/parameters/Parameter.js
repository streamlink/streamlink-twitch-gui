import { makeArray } from "@ember/array";
import { get } from "@ember/object";
import { isNone } from "@ember/utils";
import Substitution from "utils/parameters/Substitution";


/**
 * @class Parameter
 */
export default class Parameter {
	/**
	 * @param {String?} name
	 * @param {(String|String[]|Function)?} cond
	 * @param {String?} value
	 * @param {Substitution[]?} subst
	 */
	constructor( name, cond, value, subst ) {
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
	validate( context ) {
		return this.cond.every( cond =>
			// cond may be bound to something else
			cond.call( context, context )
		);
	}

	/**
	 * @param {Object} context
	 * @returns {(String|Boolean)}
	 */
	getValue( context ) {
		if ( isNone( this.value ) ) { return false; }
		let value = String( get( context, this.value ) );

		return this.subst
			? Substitution.substitute( context, this.subst, value, true )
			: value;
	}

	/**
	 * @param {Object} context
	 * @returns {String[]}
	 */
	get( context ) {
		let res = [];

		if ( !isNone( this.name ) ) {
			res.push( this.name );
		}

		let value = this.getValue( context );
		if ( value !== false && value.length ) {
			res.push( value );
		}

		return res;
	}

	/**
	 * Turn an array of parameters into an array of strings in context of an object
	 * @param {Object} context
	 * @param {Parameter[]} parameters
	 * @returns {String[]}
	 */
	static getParameters( context, parameters ) {
		return parameters
			// a parameter must fulfill every condition
			.filter( parameter => parameter.validate( context ) )
			// return a list of each parameter's name and its (substituted) value
			.reduce( ( arr, parameter ) => {
				let params = parameter.get( context );
				arr.push( ...makeArray( params ) );

				return arr;
			}, [] );
	}
}
