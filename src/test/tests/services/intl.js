import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";
import { set, observer } from "@ember/object";
import Service from "@ember/service";

import intlServiceInjector from "inject-loader?ember-intl&config&utils/system-locale!services/intl";


module( "services/intl", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			SettingsService: Service.extend({
				content: {
					gui: {
						language: undefined
					}
				}
			})
		})
	});

	/** @typedef {Object} TestContextServicesIntl */
	hooks.beforeEach( /** @this {TestContextServicesIntl} */ function() {
		const { default: IntlService } = intlServiceInjector({
			"ember-intl": { Service },
			"config": {
				locales: {
					locales: {
						en: true,
						de: true
					}
				}
			},
			"utils/system-locale": "en"
		});

		this.localeSpy = sinon.spy();

		this.owner.register( "service:intl", IntlService.extend({
			localeObserver: observer( "locale", this.localeSpy )
		}) );
	});


	test( "IntlService", function( assert ) {
		/** @this {TestContextServicesIntl} */
		/** @type {SettingsService} */
		const SettingsService = this.owner.lookup( "service:settings" );
		/** @type {IntlService} */
		const IntlService = this.owner.lookup( "service:intl" );

		set( SettingsService, "content.gui.language", "auto" );

		assert.ok( this.localeSpy.called, "Sets locale when settings load or get changed" );
		assert.propEqual( IntlService.locale, [ "en" ], "Translates auto to system locale" );

		set( SettingsService, "content.gui.language", "de" );
		assert.propEqual( IntlService.locale, [ "de" ], "Sets available locale" );

		set( SettingsService, "content.gui.language", "fr" );
		assert.propEqual( IntlService.locale, [ "en" ], "Sets system locale for invalid ones" );
	});
});
