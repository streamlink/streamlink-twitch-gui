import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";
import { set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import titleBarComponentInjector
	from "inject-loader?config&nwjs/debug!ui/components/title-bar/component";


module( "ui/components/title-bar", function( hooks ) {
	const { default: TitleBarComponent } = titleBarComponentInjector({
		"config": {
			"main": {
				"display-name": "application-name"
			}
		},
		"nwjs/debug": false
	});

	setupRenderingTest( hooks, {
		resolver: buildResolver({
			TitleBarComponent,
			SearchBarComponent: Component.extend({
				classNames: "search-bar-component"
			}),
			I18nService: FakeI18nService,
			THelper: FakeTHelper
		})
	});

	hooks.beforeEach(function() {
		this.nwjsDevToolsSpy = sinon.spy();
		this.nwjsReloadSpy = sinon.spy();
		this.nwjsMinimizeSpy = sinon.spy();
		this.nwjsMaximizeSpy = sinon.spy();
		this.nwjsCloseSpy = sinon.spy();
		this.routingTransitionToSpy = sinon.spy();
		this.routingHomepageSpy = sinon.spy();

		this.owner.register( "service:auth", Service.extend({
			session: {
				isLoggedIn: true,
				isPending: false,
				user_name: "user"
			}
		}) );
		this.owner.register( "service:notification", Service.extend({
			enabled: true,
			paused: false,
			error: false,
			statusText: "Notifications are enabled"
		}) );
		this.owner.register( "service:nwjs", Service.extend({
			devTools: this.nwjsDevToolsSpy,
			reload: this.nwjsReloadSpy,
			minimize: this.nwjsMinimizeSpy,
			maximize: this.nwjsMaximizeSpy,
			close: this.nwjsCloseSpy
		}) );
		this.owner.register( "service:-routing", Service.extend({
			transitionTo: this.routingTransitionToSpy,
			homepage: this.routingHomepageSpy
		}) );
		this.owner.register( "service:settings", Service.extend({
			gui: {
				hidebuttons: false
			}
		}) );
		this.owner.register( "service:streaming", Service.extend({
			model: []
		}) );
	});


	test( "TitleBarComponent", async function( assert ) {
		const AuthService = this.owner.lookup( "service:auth" );
		const NotificationService = this.owner.lookup( "service:notification" );
		const SettingsService = this.owner.lookup( "service:settings" );
		const StreamingService = this.owner.lookup( "service:streaming" );

		this.set( "isDebug", false );
		await render( hbs`{{title-bar isDebug=isDebug}}` );
		const elem = this.element.querySelector( ".title-bar-component" );

		assert.ok( elem instanceof HTMLElement, "Component renders" );

		assert.strictEqual(
			elem.querySelector( "h1" ).innerText,
			"application-name",
			"Sets the application name header text"
		);

		await click( elem.querySelector( ".logo" ) );
		assert.ok(
			this.routingHomepageSpy.calledOnce,
			"Clicking the logo redirects to the homepage"
		);

		assert.ok(
			elem.querySelector( ".search-bar-component" ) instanceof HTMLElement,
			"Does have a search bar"
		);

		await click( elem.querySelector( ".btn-reload" ) );
		assert.ok(
			this.nwjsReloadSpy.calledOnce,
			"Clicking reload button reloads the window"
		);
		await click( elem.querySelector( ".btn-devtools" ) );
		assert.ok(
			this.nwjsDevToolsSpy.calledOnce,
			"Clicking devtools button opens the devtools"
		);
		await click( elem.querySelector( ".btn-min" ) );
		assert.ok(
			this.nwjsMinimizeSpy.calledOnce,
			"Clicking minimize button minimizes the window"
		);
		await click( elem.querySelector( ".btn-max" ) );
		assert.ok(
			this.nwjsMaximizeSpy.calledOnce,
			"Clicking maximize button maximizes the window"
		);
		await click( elem.querySelector( ".btn-close" ) );
		assert.ok(
			this.nwjsCloseSpy.calledOnce,
			"Clicking close button closes the window"
		);

		assert.notOk(
			elem.querySelector( ".buttons-window" ).classList.contains( "buttons-hidden" ),
			"Window buttons are not hidden by default"
		);
		run( () => set( SettingsService, "gui.hidebuttons", true ) );
		assert.ok(
			elem.querySelector( ".buttons-window" ).classList.contains( "buttons-hidden" ),
			"Window buttons are now hidden"
		);

		assert.ok(
			elem.querySelector( ".buttons-debug" ).classList.contains( "hidden" ),
			"Debug buttons are hidden in non-debug-mode"
		);
		this.set( "isDebug", true );
		assert.notOk(
			elem.querySelector( ".buttons-debug" ).classList.contains( "hidden" ),
			"Debug buttons are not hidden in debug-mode"
		);

		await click( elem.querySelector( ".btn-settings" ) );
		assert.propEqual(
			this.routingTransitionToSpy.lastCall.args,
			[ "settings" ],
			"Clicking the settings button redirects to the settings menu"
		);

		await click( elem.querySelector( ".btn-watching" ) );
		assert.propEqual(
			this.routingTransitionToSpy.lastCall.args,
			[ "watching" ],
			"Clicking the watching button redirects to the watching menu"
		);
		assert.ok(
			elem.querySelector( ".btn-watching" ).classList.contains( "btn-hidden" ),
			"The watching button is hidden while not watching any streams"
		);
		run( () => set( StreamingService, "model.length", 1 ) );
		assert.notOk(
			elem.querySelector( ".btn-watching" ).classList.contains( "btn-hidden" ),
			"The watching button is visible while watching streams"
		);
		assert.strictEqual(
			elem.querySelector( ".btn-watching .indicator" ).innerText,
			"1",
			"The watching button's indicator is showing the number of streams being watched"
		);

		assert.ok(
			elem.querySelector( ".btn-user" ),
			"Does have a user button while being logged in"
		);
		assert.notOk(
			elem.querySelector( ".btn-no-user" ),
			"Does not have a no-user button while being logged in"
		);

		assert.strictEqual(
			elem.querySelector( ".btn-user" ).getAttribute( "title" ),
			// eslint-disable-next-line quotes
			'components.title-bar.loggedin{"name":"user","status":"Notifications are enabled"}',
			"The user button does have the correct title while being logged in"
		);

		assert.ok(
			elem.querySelector( ".btn-user .indicator" ),
			"The user button has an indicator while notifications are enabled"
		);
		assert.notOk(
			elem.querySelector( ".btn-user .indicator" ).classList.contains( "indicator-disabled" ),
			"The user button's indicator is not disabled while notifications are not paused"
		);
		assert.notOk(
			elem.querySelector( ".btn-user .indicator" ).classList.contains( "indicator-error" ),
			"The user button's indicator is not showing an error when notifications are working"
		);

		run( () => set( NotificationService, "error", true ) );
		assert.ok(
			elem.querySelector( ".btn-user .indicator" ).classList.contains( "indicator-error" ),
			"The user button's indicator is showing an error when notifications are not working"
		);

		run( () => set( NotificationService, "paused", true ) );
		assert.ok(
			elem.querySelector( ".btn-user .indicator" ).classList.contains( "indicator-disabled" ),
			"The user button's indicator is disabled while notifications are paused"
		);
		assert.notOk(
			elem.querySelector( ".btn-user .indicator" ).classList.contains( "indicator-error" ),
			"The user button's indicator is not showing an error when notifications are paused"
		);

		run( () => set( NotificationService, "enabled", false ) );
		assert.notOk(
			elem.querySelector( ".btn-user" ).classList.contains( "btn-indicator" ),
			"The user button does not have an indicator while notifications are disabled"
		);
		assert.notOk(
			elem.querySelector( ".btn-user .indicator" ),
			"The user button does not have an indicator while notifications are disabled"
		);

		assert.notOk(
			elem.querySelector( ".btn-user" ).classList.contains( "btn-user-pending" ),
			"The user button is not in a pending state intially"
		);
		run( () => set( AuthService, "session.isPending", true ) );
		assert.ok(
			elem.querySelector( ".btn-user" ).classList.contains( "btn-user-pending" ),
			"The user button is in a pending state now"
		);

		await click( elem.querySelector( ".btn-user" ) );
		assert.propEqual(
			this.routingTransitionToSpy.lastCall.args,
			[ "user.index" ],
			"Clicking the user button redirects to the user index route"
		);

		run( () => set( AuthService, "session.isLoggedIn", false ) );
		assert.notOk(
			elem.querySelector( ".btn-user" ),
			"Does not have a user button while being logged out"
		);
		assert.ok(
			elem.querySelector( ".btn-no-user" ),
			"Does have a no-user button while being logged out"
		);

		assert.strictEqual(
			elem.querySelector( ".btn-no-user" ).getAttribute( "title" ),
			"components.title-bar.loggedout",
			"The no-user button does have the correct title while not being logged in"
		);

		await click( elem.querySelector( ".btn-no-user" ) );
		assert.propEqual(
			this.routingTransitionToSpy.lastCall.args,
			[ "user.index" ],
			"Clicking the no-user button redirects to the user index route"
		);
	});

});
