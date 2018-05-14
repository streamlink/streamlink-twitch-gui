import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import sinon from "sinon";
import { get, set, observer } from "@ember/object";
import Service from "@ember/service";

import i18nServiceInjector
	from "inject-loader?ember-i18n/addon&config&./system-locale!services/i18n/service";


module( "services/i18n/service", {
	beforeEach() {
		const SettingsService = Service.extend({
			content: {
				gui: {
					language: undefined
				}
			}
		});
		const { default: I18nService } = i18nServiceInjector({
			"ember-i18n/addon": { Service },
			"config": {
				locales: {
					locales: {
						en: true,
						de: true
					}
				}
			},
			"./system-locale": "en"
		});

		this.localeSpy = sinon.spy();

		this.owner = buildOwner();
		this.owner.register( "service:settings", SettingsService );
		this.owner.register( "service:i18n", I18nService.extend({
			localeObserver: observer( "locale", this.localeSpy )
		}) );
	},

	afterEach() {
		runDestroy( this.owner );
	}
});


test( "I18nService", function( assert ) {

	const SettingsService = this.owner.lookup( "service:settings" );
	const I18nService = this.owner.lookup( "service:i18n" );

	set( SettingsService, "content.gui.language", "auto" );

	assert.ok( this.localeSpy.called, "Sets locale when settings load or get changed" );
	assert.strictEqual( get( I18nService, "locale" ), "en", "Translates auto to system locale" );

	set( SettingsService, "content.gui.language", "de" );
	assert.strictEqual( get( I18nService, "locale" ), "de", "Sets available locale" );

	set( SettingsService, "content.gui.language", "fr" );
	assert.strictEqual( get( I18nService, "locale" ), "en", "Sets system locale for invalid ones" );

});
