import Helper from "@ember/component/helper";
import { get, observer } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";


/**
 * Fake I18nService for testing translations
 */
export const I18nService = Service.extend({
	locale: "en",

	t( key, data ) {
		const serializedData = data && Object.keys( data ).length
			? JSON.stringify( data )
			: "";

		return `${key}${serializedData}`;
	}
});


/**
 * Fake Translation helper which doesn't use a data EmberObject with an unknownProperty function
 */
export const THelper = Helper.extend({
	i18n: service(),

	compute( [ key ], data ) {
		return get( this, "i18n" ).t( key, data );
	},

	_localeObserver: observer( "i18n.locale", function() {
		this.recompute();
	})
});
