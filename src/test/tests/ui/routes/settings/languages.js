import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { FakeIntlService, FakeTHelper } from "intl-utils";
import { visit, currentRouteName, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Component from "@ember/component";
import { set } from "@ember/object";
import Router from "@ember/routing/router";
import Service from "@ember/service";

import SettingsRoute from "ui/routes/settings/route";
import SettingsLanguagesRoute from "ui/routes/settings/languages/route";
import settingsLanguagesControllerInjector
	from "inject-loader?config!ui/routes/settings/languages/controller";
import SettingsLanguagesTemplate from "ui/routes/settings/languages/template.hbs";

import CheckBoxComponent from "ui/components/form/check-box/component";
import FlagIconComponent from "ui/components/flag-icon/component";
import { helper as BoolAndHelper } from "ui/components/helper/bool-and";
import { helper as BoolOrHelper } from "ui/components/helper/bool-or";
import { helper as BoolNotHelper } from "ui/components/helper/bool-not";


module( "ui/routes/settings/languages", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "settings", function() {
				this.route( "languages" );
			});
		}),

		IntlService: FakeIntlService,
		ModalService: Service.extend({
			openModal: new Function()
		}),
		SettingsService: Service.extend({
			content: {
				toJSON: () => ({
					streams: {
						languages_fade: false,
						languages_filter: false,
						languages: {
							en: false
						}
					}
				})
			}
		}),

		BoolAndHelper,
		BoolOrHelper,
		BoolNotHelper,
		THelper: FakeTHelper,

		CheckBoxComponent,
		FlagIconComponent,
		SettingsRowComponent: Component.extend({
			layout: hbs`{{yield}}`
		}),

		SettingsRoute,
		SettingsLanguagesRoute,
		SettingsLanguagesTemplate
	});

	setupApplicationTest( hooks );

	hooks.beforeEach(function() {
		const { default: SettingsLanguagesController } = settingsLanguagesControllerInjector({
			config: {
				langs: {
					de: { flag: "de" },
					en: { flag: "en" },
					fr: { flag: "fr", disabled: true }
				}
			}
		});
		this.owner.register( "controller:settings-languages", SettingsLanguagesController );
	});


	test( "Route", async function( assert ) {
		await visit( "/settings/languages" );
		assert.strictEqual( currentRouteName(), "settings.languages", "Has entered the route" );

		const route = this.owner.lookup( "route:settings-languages" );
		const controller = this.owner.lookup( "controller:settings-languages" );

		assert.ok( route._onBufferChange, "Has a buffer onChange callback" );
		assert.notOk( controller.hasAnySelection, "Has no language selection" );
		assert.notOk( controller.hasSingleSelection, "Has no language selection" );

		set( controller, "model.streams.languages.en", true );
		await new Promise( resolve => setTimeout( resolve, 1 ) );
		assert.ok( controller.hasAnySelection, "Has a language selection" );
		assert.ok( controller.hasSingleSelection, "Has single language selection" );
		controller.model.discardChanges();

		await visit( "/" );
		assert.strictEqual( currentRouteName(), "index", "Has left the route" );
		assert.notOk( route._onBufferChange, "Unsets buffer onChange callback" );
	});

	test( "Template", async function( assert ) {
		await visit( "/settings/languages" );

		const checkboxes = Array.from(
			this.element.querySelectorAll( "fieldset > div:first-of-type .check-box-component" )
		);
		const languages = Array.from(
			this.element.querySelectorAll( ".filter-lang .check-box-component" )
		);
		assert.propEqual(
			checkboxes.map( cb => Array.from( cb.querySelectorAll( "div > div" ) )
				.map( node => node.textContent.trim() )
			),
			[
				[
					"settings.languages.filter.values.fade.text",
					"settings.languages.filter.values.fade.description{\"htmlSafe\":true}"
				],
				[
					"settings.languages.filter.values.filter.text",
					"settings.languages.filter.values.filter.description{\"htmlSafe\":true}"
				]
			],
			"Shows both checkboxes with correct label and description"
		);
		assert.propEqual(
			checkboxes.map( cb => ([
				cb.classList.contains( "checked" ),
				cb.classList.contains( "disabled" )
			]) ),
			[ [ false, true ], [ false, true ] ],
			"Both checkboxes are unchecked and disabled"
		);
		assert.propEqual(
			languages.map( lang => ([
				lang.textContent.trim(),
				Array.from( lang.querySelector( ".flag-icon-component" ).classList.values() )
					.find( name => /^flag-\w+$/.test( name ) ),
				lang.classList.contains( "checked" )
			]) ),
			[ [ "languages.de(de)", "flag-de", false ], [ "languages.en(en)", "flag-en", false ] ],
			"Shows the enabled language selection checkboxes with correct flags"
		);

		// start selecting languages

		await click( ".flag-en" );
		assert.propEqual(
			checkboxes.map( cb => cb.classList.contains( "disabled" ) ),
			[ false, false ],
			"Both checkboxes are enabled if one language is selected"
		);
		assert.propEqual(
			languages.map( lang => lang.classList.contains( "checked" ) ),
			[ false, true ],
			"Checkbox for language.en is checked"
		);

		await click( ".flag-de" );
		assert.propEqual(
			checkboxes.map( cb => cb.classList.contains( "disabled" ) ),
			[ false, true ],
			"Filter checkbox is disabled if two languages are selected"
		);

		await click( ".flag-de" );
		await click( checkboxes[1] );
		assert.propEqual(
			checkboxes.map( cb => cb.classList.contains( "disabled" ) ),
			[ true, false ],
			"Fade checkbox is disabled if filter checkbox is checked"
		);

		await click( ".flag-de" );
		assert.propEqual(
			checkboxes.map( cb => cb.classList.contains( "disabled" ) ),
			[ false, true ],
			"Fade checkbox is enabled again two languages are selected"
		);

		await click( "[data-action-uncheck-all]" );
		assert.propEqual(
			languages.map( lang => lang.classList.contains( "checked" ) ),
			[ false, false ],
			"Unchecks all language checkboxes"
		);
	});
});
