import Helper from "@ember/component/helper";
import { get, observer } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";


const { hasOwnProperty } = {};


/**
 * Fake I18nService for testing translations
 */
export class FakeI18nService extends Service {
	locale = "en";
	translations = {};

	t( key, data ) {
		const translation = hasOwnProperty.call( this.translations, key )
			? this.translations[ key ]
			: key;
		const serializedData = data && Object.keys( data ).length
			? JSON.stringify( data )
			: "";

		return `${translation}${serializedData}`;
	}

	exists( key ) {
		return hasOwnProperty.call( this.translations, key );
	}

	addTranslations( locale, translations ) {
		Object.assign( this.translations, translations );
	}
}


/**
 * Fake Translation helper which doesn't use a data EmberObject with an unknownProperty function
 */
export const FakeTHelper = Helper.extend({
	i18n: service(),

	compute( [ key ], data ) {
		return get( this, "i18n" ).t( key, data );
	},

	_localeObserver: observer( "i18n.locale", function() {
		this.recompute();
	})
});
