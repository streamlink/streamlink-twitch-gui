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
import {
	ATTR_STREAMS_LANGUAGES_FADE
} from "data/models/settings/streams/fragment";

import CheckBoxComponent from "ui/components/form/check-box/component";
import RadioButtonsComponent from "ui/components/form/radio-buttons/component";
import RadioButtonsItemComponent from "ui/components/form/radio-buttons-item/component";
import FlagIconComponent from "ui/components/flag-icon/component";
import { helper as BoolAndHelper } from "ui/components/helper/bool-and";
import { helper as BoolOrHelper } from "ui/components/helper/bool-or";
import { helper as BoolNotHelper } from "ui/components/helper/bool-not";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


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
						languages_filter: ATTR_STREAMS_LANGUAGES_FADE,
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
		IsEqualHelper,
		THelper: FakeTHelper,

		CheckBoxComponent,
		RadioButtonsComponent,
		RadioButtonsItemComponent,
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
					fr: { flag: "fr", disabled: true },
					// special uppercase language code
					ID: { flag: "id" }
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

		set( controller, "model.streams.languages.en", true );
		await new Promise( resolve => setTimeout( resolve, 1 ) );
		assert.ok( controller.hasAnySelection, "Has a language selection" );
		controller.model.discardChanges();

		await visit( "/" );
		assert.strictEqual( currentRouteName(), "index", "Has left the route" );
		assert.notOk( route._onBufferChange, "Unsets buffer onChange callback" );
	});

	test( "Template", async function( assert ) {
		await visit( "/settings/languages" );

		const radiobuttons = Array.from(
			this.element.querySelectorAll( ".radio-buttons-item-component" )
		);
		const languages = Array.from(
			this.element.querySelectorAll( ".filter-lang .check-box-component" )
		);
		assert.propEqual(
			radiobuttons.map( cb => Array.from( cb.querySelectorAll( "div > div" ) )
				.map( node => node.textContent.trim() )
			),
			[
				[
					"settings.languages.filter.values.fade.text",
					"settings.languages.filter.values.fade.description"
				],
				[
					"settings.languages.filter.values.filter.text",
					"settings.languages.filter.values.filter.description"
				]
			],
			"Shows both checkboxes with correct label and description"
		);
		assert.propEqual(
			radiobuttons.map( cb => ([
				cb.classList.contains( "checked" ),
				cb.classList.contains( "disabled" )
			]) ),
			[ [ true, true ], [ false, true ] ],
			"Both radiobuttons are disabled and the first one is checked"
		);
		assert.propEqual(
			languages.map( lang => ([
				lang.textContent.trim(),
				Array.from( lang.querySelector( ".flag-icon-component" ).classList.values() )
					.find( name => /^flag-\w+$/.test( name ) ),
				lang.classList.contains( "checked" )
			]) ),
			[
				[ "languages.de(de)", "flag-de", false ],
				[ "languages.en(en)", "flag-en", false ],
				[ "languages.ID(id)", "flag-id", false ]
			],
			"Shows the language selection checkboxes with correct flags"
		);

		// start selecting languages

		await click( ".flag-en" );
		assert.propEqual(
			radiobuttons.map( cb => cb.classList.contains( "disabled" ) ),
			[ false, false ],
			"All radiobuttons are enabled if at least one language is selected"
		);
		assert.propEqual(
			languages.map( lang => lang.classList.contains( "checked" ) ),
			[ false, true, false ],
			"Checkbox for language.en is checked"
		);

		await click( "[data-action-uncheck-all]" );
		assert.propEqual(
			radiobuttons.map( cb => cb.classList.contains( "disabled" ) ),
			[ true, true ],
			"Both radiobuttons are disabled again if no language is selected"
		);
		assert.propEqual(
			languages.map( lang => lang.classList.contains( "checked" ) ),
			[ false, false, false ],
			"Unchecks all language checkboxes"
		);
	});
});
