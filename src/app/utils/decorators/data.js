import { fragment as modelFragment } from "ember-data-model-fragments/attributes";


/**
 * Class decorator:
 * Sets/merges the class's `urlFragments` property, which is used by the {CustomRESTAdapter}
 * @param {Object<string, function(DS.Model, string, Object?)>} fragments
 * @returns {function(Object): undefined}
 */
export function urlFragments( fragments ) {
	return cls => {
		const parentClass = Object.getPrototypeOf( cls );
		const parentFragments = parentClass.urlFragments || {};
		cls.urlFragments = Object.assign( {}, parentFragments, fragments );
	};
}

/**
 * Property decorator:
 * Ember-Data Model Fragments fragment attribute wrapper with empty default value
 * @param {string} name
 * @param {Object?} options
 * @returns {PropertyDescriptor}
 */
export function fragment( name, options = {} ) {
	return modelFragment(
		name,
		Object.assign( { defaultValue: {} }, options )
	);
}
