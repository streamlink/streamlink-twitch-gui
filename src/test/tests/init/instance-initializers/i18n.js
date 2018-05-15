import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import sinon from "sinon";
import Service from "@ember/service";

import I18nInstanceInitializer from "init/instance-initializers/i18n";
import { locales as localesConfig } from "config";


module( "init/instance-initializer/i18n", {
	beforeEach() {
		this.addTranslationsSpy = sinon.spy();

		this.owner = buildOwner();
		this.owner.register( "service:i18n", Service.extend({
			addTranslations: this.addTranslationsSpy
		}) );
	},

	afterEach() {
		runDestroy( this.owner );
		this.owner = null;
	}
});


test( "Registrations", function( assert ) {

	const registry = this.owner.__registry__;
	I18nInstanceInitializer.initialize( this.owner );

	assert.ok( registry.has( "util:i18n/compile-template" ), "Has a template compiler" );
	assert.ok( registry.has( "util:i18n/missing-message" ), "Has a missing message definition" );

	for ( const [ locale ] of Object.entries( localesConfig.locales ) ) {
		assert.ok(
			registry.has( `locale:${locale}/config` ),
			`Has a config for locale ${locale}`
		);
		assert.ok(
			registry.has( `locale:${locale}/translations` ),
			`Has translations for locale ${locale}`
		);
		assert.ok(
			this.addTranslationsSpy.calledWith( locale ),
			`Translations for locale ${locale} were added to the I18nService`
		);
	}

});


test( "Translation namespaces", function( assert ) {

	I18nInstanceInitializer.initialize( this.owner );

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


/*
test( "Translations", function( assert ) {

	const trEn = this.addTranslationsSpy.args.filter( ([ locale ]) => locale === "en" )[0][1];
	const trAll = this.addTranslationsSpy.args.filter( ([ locale ]) => locale !== "en" );

	function getTranslationKeys( input ) {
		const output = {};
		for ( const [ key, value ] of Object.entries( input ) ) {
			output[ key ] = typeof value === "object"
				? getTranslationKeys( value )
				: null;
		}
		return output;
	}

	const keysEn = getTranslationKeys( trEn );
	for ( const [ locale, translation ] of trAll ) {
		assert.propEqual(
			getTranslationKeys( translation ),
			keysEn,
			`Translations for locale ${locale} match keys of translations of locale en`
		);
	}

});
*/
