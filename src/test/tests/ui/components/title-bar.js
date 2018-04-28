import { moduleForComponent, test } from "ember-qunit";
import { buildResolver } from "test-utils";
import { I18nService, THelper } from "i18n-utils";
import Component from "@ember/component";
import { set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";
import sinon from "sinon";

import titleBarComponentInjector
	from "inject-loader?config&nwjs/debug!ui/components/title-bar/component";


const { default: TitleBarComponent } = titleBarComponentInjector({
	"config": {
		"main": {
			"display-name": "application-name"
		}
	},
	"nwjs/debug": false
});


moduleForComponent( "title-bar", "ui/components/title-bar", {
	unit: true,
	needs: [
		"service:i18n",
		"helper:t"
	],
	resolver: buildResolver({
		TitleBarComponent,
		I18nService,
		THelper
	}),
	beforeEach() {
		this.nwjsDevToolsSpy = sinon.spy();
		this.nwjsReloadSpy = sinon.spy();
		this.nwjsMinimizeSpy = sinon.spy();
		this.nwjsMaximizeSpy = sinon.spy();
		this.nwjsCloseSpy = sinon.spy();
		this.routingTransitionToSpy = sinon.spy();
		this.routingHomepageSpy = sinon.spy();

		this.register( "component:search-bar", Component.extend({
			classNames: "search-bar-component"
		}) );
		this.register( "service:auth", Service.extend({
			session: {
				isLoggedIn: true,
				isPending: false,
				user_name: "user"
			}
		}) );
		this.register( "service:notification", Service.extend({
			enabled: true,
			paused: false,
			error: false,
			statusText: "Notifications are enabled"
		}) );
		this.register( "service:nwjs", Service.extend({
			devTools: this.nwjsDevToolsSpy,
			reload: this.nwjsReloadSpy,
			minimize: this.nwjsMinimizeSpy,
			maximize: this.nwjsMaximizeSpy,
			close: this.nwjsCloseSpy
		}) );
		this.register( "service:-routing", Service.extend({
			transitionTo: this.routingTransitionToSpy,
			homepage: this.routingHomepageSpy
		}) );
		this.register( "service:settings", Service.extend({
			gui: {
				hidebuttons: false
			}
		}) );
		this.register( "service:streaming", Service.extend({
			model: []
		}) );
	}
});


test( "TitleBarComponent", function( assert ) {

	const subject = this.subject();
	const $elem = this.$();

	assert.ok(
		$elem.hasClass( "title-bar-component" ),
		"Component does have the title-bar-component class"
	);

	assert.strictEqual(
		$elem.children( "h1" ).text().trim(),
		"application-name",
		"Sets the application name header text"
	);

	$elem.children( ".logo" ).click();
	assert.ok( this.routingHomepageSpy.calledOnce, "Clicking the logo redirects to the homepage" );

	assert.ok(
		$elem.children( ".search-bar-component" ).get( 0 ) instanceof HTMLElement,
		"Does have a search bar"
	);

	$elem.find( ".btn-reload" ).click();
	assert.ok( this.nwjsReloadSpy.calledOnce, "Clicking reload button reloads the window" );
	$elem.find( ".btn-devtools" ).click();
	assert.ok( this.nwjsDevToolsSpy.calledOnce, "Clicking devtools button opens the devtools" );
	$elem.find( ".btn-min" ).click();
	assert.ok( this.nwjsMinimizeSpy.calledOnce, "Clicking minimize button minimizes the window" );
	$elem.find( ".btn-max" ).click();
	assert.ok( this.nwjsMaximizeSpy.calledOnce, "Clicking maximize button maximizes the window" );
	$elem.find( ".btn-close" ).click();
	assert.ok( this.nwjsCloseSpy.calledOnce, "Clicking close button closes the window" );

	assert.notOk(
		$elem.find( ".buttons-window" ).hasClass( "buttons-hidden" ),
		"Window buttons are not hidden by default"
	);
	run( () => set( subject, "settings.gui.hidebuttons", true ) );
	assert.ok(
		$elem.find( ".buttons-window" ).hasClass( "buttons-hidden" ),
		"Window buttons are now hidden"
	);

	assert.ok(
		$elem.find( ".buttons-debug" ).hasClass( "hidden" ),
		"Debug buttons are hidden in non-debug-mode"
	);
	run( () => set( subject, "isDebug", true ) );
	assert.notOk(
		$elem.find( ".buttons-debug" ).hasClass( "hidden" ),
		"Debug buttons are not hidden in debug-mode"
	);

	$elem.find( ".btn-settings" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "settings" ],
		"Clicking the settings button redirects to the settings menu"
	);

	$elem.find( ".btn-watching" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "watching" ],
		"Clicking the watching button redirects to the watching menu"
	);
	assert.ok(
		$elem.find( ".btn-watching" ).hasClass( "btn-hidden" ),
		"The watching button is hidden while not watching any streams"
	);
	run( () => set( subject, "streaming.model.length", 1 ) );
	assert.notOk(
		$elem.find( ".btn-watching" ).hasClass( "btn-hidden" ),
		"The watching button is visible while watching streams"
	);
	assert.strictEqual(
		$elem.find( ".btn-watching .indicator" ).text(),
		"1",
		"The watching button's indicator is showing the number of streams being watched"
	);

	assert.ok(
		$elem.find( ".btn-user" ).length,
		"Does have a user button while being logged in"
	);
	assert.notOk(
		$elem.find( ".btn-no-user" ).length,
		"Does not have a no-user button while being logged in"
	);

	assert.strictEqual(
		$elem.find( ".btn-user" ).attr( "title" ),
		"components.title-bar.loggedin{\"name\":\"user\",\"status\":\"Notifications are enabled\"}",
		"The user button does have the correct title while being logged in"
	);

	assert.ok(
		$elem.find( ".btn-user .indicator" ).length,
		"The user button has an indicator while notifications are enabled"
	);
	assert.notOk(
		$elem.find( ".btn-user .indicator" ).hasClass( "indicator-disabled" ),
		"The user button's indicator is not disabled while notifications are not paused"
	);
	assert.notOk(
		$elem.find( ".btn-user .indicator" ).hasClass( "indicator-error" ),
		"The user button's indicator is not showing an error when notifications are working"
	);

	run( () => set( subject, "notification.error", true ) );
	assert.ok(
		$elem.find( ".btn-user .indicator" ).hasClass( "indicator-error" ),
		"The user button's indicator is showing an error when notifications are not working"
	);

	run( () => set( subject, "notification.paused", true ) );
	assert.ok(
		$elem.find( ".btn-user .indicator" ).hasClass( "indicator-disabled" ),
		"The user button's indicator is disabled while notifications are paused"
	);
	assert.notOk(
		$elem.find( ".btn-user .indicator" ).hasClass( "indicator-error" ),
		"The user button's indicator is not showing an error when notifications are paused"
	);

	run( () => set( subject, "notification.enabled", false ) );
	assert.notOk(
		$elem.find( ".btn-user" ).hasClass( "btn-indicator" ),
		"The user button does not have an indicator while notifications are disabled"
	);
	assert.notOk(
		$elem.find( ".btn-user .indicator" ).length,
		"The user button does not have an indicator while notifications are disabled"
	);

	assert.notOk(
		$elem.find( ".btn-user" ).hasClass( "btn-user-pending" ),
		"The user button is not in a pending state intially"
	);
	run( () => set( subject, "auth.session.isPending", true ) );
	assert.ok(
		$elem.find( ".btn-user" ).hasClass( "btn-user-pending" ),
		"The user button is in a pending state now"
	);

	$elem.find( ".btn-user" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "user.index" ],
		"Clicking the user button redirects to the user index route"
	);

	run( () => set( subject, "auth.session.isLoggedIn", false ) );
	assert.notOk(
		$elem.find( ".btn-user" ).length,
		"Does not have a user button while being logged out"
	);
	assert.ok(
		$elem.find( ".btn-no-user" ).length,
		"Does have a no-user button while being logged out"
	);

	assert.strictEqual(
		$elem.find( ".btn-no-user" ).attr( "title" ),
		"components.title-bar.loggedout",
		"The no-user button does have the correct title while not being logged in"
	);

	$elem.find( ".btn-no-user" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "user.index" ],
		"Clicking the no-user button redirects to the user index route"
	);

});
