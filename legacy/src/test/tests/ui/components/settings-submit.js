import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeIntlService, FakeTHelper } from "intl-utils";
import { render, clearRender } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";

import SettingsSubmitComponent from "ui/components/settings-submit/component";


module( "ui/components/settings-submit", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			SettingsSubmitComponent,
			FormButtonComponent: Component.extend(),
			IntlService: FakeIntlService,
			THelper: FakeTHelper
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			global: window
		});
	});
	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Basic isDirty and disabled states", async function( assert ) {
		this.setProperties({
			isDirty: false,
			disabled: false
		});
		await render( hbs`{{settings-submit isDirty=isDirty disabled=disabled delay=1000}}` );

		const elem = this.element.querySelector( ".settings-submit-component" );
		assert.ok( elem.classList.contains( "faded" ), "Is faded in its default state" );

		this.set( "isDirty", true );
		assert.notOk( elem.classList.contains( "faded" ), "Is not faded after becoming dirty" );

		this.set( "disabled", true );
		assert.ok( elem.classList.contains( "faded" ), "Is faded after getting disabled" );

		this.set( "isDirty", false );
		this.fakeTimer.tick( 1000 );
		assert.ok( elem.classList.contains( "faded" ), "Nothing happens while being disabled" );

		this.set( "isDirty", true );
		this.set( "disabled", false );
		assert.notOk( elem.classList.contains( "faded" ), "Is not faded after re-enabling" );
	});


	test( "Delayed fading", async function( assert ) {
		this.set( "isDirty", true );
		await render( hbs`{{settings-submit isDirty=isDirty disabled=false delay=1000}}` );
		const elem = this.element.querySelector( ".settings-submit-component" );

		assert.notOk( elem.classList.contains( "faded" ), "Is not faded initially" );

		this.set( "isDirty", false );
		assert.notOk( elem.classList.contains( "faded" ), "Is not yet faded" );

		this.fakeTimer.tick( 999 );
		assert.notOk( elem.classList.contains( "faded" ), "Is still not faded" );

		this.fakeTimer.tick( 1 );
		assert.ok( elem.classList.contains( "faded" ), "Is faded after the delay" );

		this.set( "isDirty", true );
		assert.notOk(
			elem.classList.contains( "faded" ),
			"Is not faded immediately when becoming dirty"
		);

		this.set( "isDirty", false );
		this.fakeTimer.tick( 500 );
		this.set( "isDirty", true );
		this.fakeTimer.tick( 500 );
		assert.notOk( elem.classList.contains( "faded" ), "Timer gets cancelled" );

		this.set( "isDirty", false );
		await clearRender();
		this.fakeTimer.tick( 1000 );
	});

});
