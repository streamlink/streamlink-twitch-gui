import Helper from "@ember/component/helper";
import { observer } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";


const { hasOwnProperty } = {};


/**
 * Fake IntlService for testing translations
 */
export class FakeIntlService extends Service {
	locale = [ "en" ];
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
	intl: service(),

	compute( [ key ], data ) {
		return this.intl.t( key, data );
	},

	_localeObserver: observer( "intl.locale", function() {
		this.recompute();
	})
});
