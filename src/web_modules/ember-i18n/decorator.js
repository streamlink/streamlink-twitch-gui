import { get, computed } from "@ember/object";
import { macro } from "@ember-decorators/object/computed";


function mapPropertiesByHash( object, hash ) {
	return Object.keys( hash ).reduce( ( obj, key ) => {
		obj[ key ] = get( object, hash[ key ] );

		return obj;
	}, {} );
}


export const t = macro( ( key, interpolations = {} ) => {
	return computed( "i18n.locale", ...Object.values( interpolations ), function() {
		/** @type {I18nService} */
		const i18n = this.i18n;

		return i18n.t( key, mapPropertiesByHash( this, interpolations ) );
	});
});
