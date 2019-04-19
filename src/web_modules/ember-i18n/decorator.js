import { get, computed } from "@ember/object";


function mapPropertiesByHash( object, hash ) {
	return Object.keys( hash ).reduce( ( obj, key ) => {
		obj[ key ] = get( object, hash[ key ] );

		return obj;
	}, {} );
}


export const t = function( key, interpolations = {} ) {
	const values = Object.values( interpolations );

	return computed( "i18n.locale", ...values, function() {
		/** @type {I18nService} */
		const i18n = this.i18n;

		return i18n.t( key, mapPropertiesByHash( this, interpolations ) );
	});
};
