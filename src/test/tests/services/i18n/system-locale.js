import { module, test } from "qunit";

import systemLocaleInjector from "inject-loader!services/i18n/system-locale";


module( "services/i18n/system-locale" );


test( "Supported locales", function( assert ) {

	const { default: systemLocale } = systemLocaleInjector({
		"config": {
			locales: {
				locales: {
					"de": "Deutsch",
					"en": "English",
					"en-us": "English (US)",
					"fr": "Français"
				},
				default: "en"
			}
		},
		"nwjs/Window": {
			window: {
				navigator: {
					languages: [ "nl", "en-GB", "en-US", "en", "de" ]
				}
			}
		}
	});

	assert.strictEqual( systemLocale, "en-us", "Finds 'en-us' as first supported system locale" );

});


test( "Unsupported locales", function( assert ) {

	const { default: systemLocale } = systemLocaleInjector({
		"config": {
			locales: {
				locales: {
					"de": "Deutsch",
					"en": "English",
					"en-us": "English (US)",
					"fr": "Français"
				},
				default: "en"
			}
		},
		"nwjs/Window": {
			window: {
				navigator: {
					languages: [ "foo" ]
				}
			}
		}
	});

	assert.strictEqual( systemLocale, "en", "Finds 'en' as default locale" );

});
