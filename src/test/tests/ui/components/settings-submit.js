import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import { I18nService, THelper } from "i18n-utils";
import Component from "@ember/component";
import sinon from "sinon";

import SettingsSubmitComponent from "ui/components/settings-submit/component";


moduleForComponent( "ui/components/settings-submit", {
	integration: true,
	resolver: buildResolver({
		SettingsSubmitComponent,
		FormButtonComponent: Component.extend(),
		I18nService,
		THelper
	}),
	beforeEach() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			target: window
		});
	},
	afterEach() {
		this.fakeTimer.restore();
	}
});


test( "Basic isDirty and disabled states", function( assert ) {

	this.set( "isDirty", false );
	this.set( "disabled", false );
	this.render( hbs`{{settings-submit isDirty=isDirty disabled=disabled delay=1000}}` );

	const $elem = this.$( ".settings-submit-component" );
	assert.ok( $elem.hasClass( "faded" ), "Is faded in its default state" );

	this.set( "isDirty", true );
	assert.notOk( $elem.hasClass( "faded" ), "Is not faded after becoming dirty" );

	this.set( "disabled", true );
	assert.ok( $elem.hasClass( "faded" ), "Is faded after getting disabled" );

	this.set( "isDirty", false );
	this.fakeTimer.tick( 1000 );
	assert.ok( $elem.hasClass( "faded" ), "Nothing happens while being disabled" );

	this.set( "isDirty", true );
	this.set( "disabled", false );
	assert.notOk( $elem.hasClass( "faded" ), "Is not faded anymore after re-enabling" );

});


test( "Delayed fading", function( assert ) {

	this.set( "isDirty", true );
	this.render( hbs`{{settings-submit isDirty=isDirty disabled=false delay=1000}}` );
	const $elem = this.$( ".settings-submit-component" );

	assert.notOk( $elem.hasClass( "faded" ), "Is not faded initially" );

	this.set( "isDirty", false );
	assert.notOk( $elem.hasClass( "faded" ), "Is not yet faded" );

	this.fakeTimer.tick( 999 );
	assert.notOk( $elem.hasClass( "faded" ), "Is still not faded" );

	this.fakeTimer.tick( 1 );
	assert.ok( $elem.hasClass( "faded" ), "Is faded after the delay" );

	this.set( "isDirty", true );
	assert.notOk( $elem.hasClass( "faded" ), "Is not faded immediately when becoming dirty" );

	this.set( "isDirty", false );
	this.fakeTimer.tick( 500 );
	this.set( "isDirty", true );
	this.fakeTimer.tick( 500 );
	assert.notOk( $elem.hasClass( "faded" ), "Timer gets cancelled" );

	this.set( "isDirty", false );
	this.clearRender();
	this.fakeTimer.tick( 1000 );

});
