import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";
import Service from "@ember/service";

import IntlInstanceInitializer from "init/instance-initializers/intl";
import { locales as localesConfig } from "config";


module( "init/instance-initializers/intl", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({})
	});

	hooks.beforeEach(function() {
		this.addTranslationsSpy = sinon.spy();

		this.owner.register( "service:intl", Service.extend({
			addTranslations: this.addTranslationsSpy
		}) );
	});


	test( "Registrations", function( assert ) {
		const registry = this.owner.__registry__;
		IntlInstanceInitializer.initialize( this.owner );

		assert.ok(
			registry.has( "util:intl/missing-message" ),
			"Has a missing message definition"
		);

		for ( const [ locale ] of Object.entries( localesConfig.locales ) ) {
			assert.ok(
				registry.has( `locale:${locale}/translations` ),
				`Has translations for locale ${locale}`
			);
			assert.ok(
				this.addTranslationsSpy.calledWith( locale ),
				`Translations for locale ${locale} were added to the IntlService`
			);
		}
	});

	test( "Translation namespaces", function( assert ) {
		IntlInstanceInitializer.initialize( this.owner );

		const translations = this.addTranslationsSpy.args.filter( ([ locale ]) => locale === "en" );

		assert.propEqual(
			Object.keys( translations[0][1] ).sort(),
			[
				"components",
				"contextmenu",
				"helpers",
				"hotkeys",
				"languages",
				"modal",
				"models",
				"qualities",
				"routes",
				"services",
				"settings",
				"themes"
			],
			"All required namespaces exist in the en locale"
		);
	});
});
