import {
	module,
	test
} from "qunit";
import sinon from "sinon";
import {
	set,
	run,
	Component,
	EventDispatcher,
	Service
} from "ember";
import {
	buildOwner,
	fixtureElement,
	getElem,
	getOutput,
	runAppend,
	runDestroy
} from "test-utils";
import titleBarComponentInjector from "inject-loader?-ember!components/TitleBarComponent";
import layout from "templates/components/TitleBarComponent.hbs";


module( "components/TitleBarComponent", {
	beforeEach() {
		const { default: TitleBarComponent } = titleBarComponentInjector({
			"templates/components/TitleBarComponent.hbs": layout,
			"config": {
				"main": {
					"display-name": "application-name"
				}
			},
			"nwjs/debug": false
		});

		this.nwjsDevToolsSpy = sinon.spy();
		this.nwjsReloadSpy = sinon.spy();
		this.nwjsMinimizeSpy = sinon.spy();
		this.nwjsMaximizeSpy = sinon.spy();
		this.nwjsCloseSpy = sinon.spy();
		this.routingTransitionToSpy = sinon.spy();
		this.routingHomepageSpy = sinon.spy();

		this.eventDispatcher = EventDispatcher.create();
		this.eventDispatcher.setup( {}, fixtureElement );
		this.owner = buildOwner();
		this.owner.register( "event_dispatcher:main", this.eventDispatcher );
		this.owner.register( "component:title-bar", TitleBarComponent );
		this.owner.register( "component:search-bar", Component.extend({
			classNames: "search-bar-component"
		}) );
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

		this.subject = this.owner.lookup( "component:title-bar" );
		runAppend( this.subject );
	},

	afterEach() {
		runDestroy( this.subject );
		runDestroy( this.eventDispatcher );
		runDestroy( this.owner );
	}
});


test( "TitleBarComponent", function( assert ) {

	assert.ok(
		getElem( this.subject ).hasClass( "title-bar-component" ),
		"Component does have the title-bar-component class"
	);

	assert.strictEqual(
		getOutput( this.subject, "> h1" ),
		"application-name",
		"Sets the application name header text"
	);

	getElem( this.subject, "> .logo" ).click();
	assert.ok( this.routingHomepageSpy.calledOnce, "Clicking the logo redirects to the homepage" );

	assert.ok(
		getElem( this.subject, "> .search-bar-component" ).length,
		"Does have a search bar"
	);

	getElem( this.subject, ".btn-reload" ).click();
	assert.ok( this.nwjsReloadSpy.calledOnce, "Clicking reload button reloads the window" );
	getElem( this.subject, ".btn-devtools" ).click();
	assert.ok( this.nwjsDevToolsSpy.calledOnce, "Clicking devtools button opens the devtools" );
	getElem( this.subject, ".btn-min" ).click();
	assert.ok( this.nwjsMinimizeSpy.calledOnce, "Clicking minimize button minimizes the window" );
	getElem( this.subject, ".btn-max" ).click();
	assert.ok( this.nwjsMaximizeSpy.calledOnce, "Clicking maximize button maximizes the window" );
	getElem( this.subject, ".btn-close" ).click();
	assert.ok( this.nwjsCloseSpy.calledOnce, "Clicking close button closes the window" );

	assert.notOk(
		getElem( this.subject, ".buttons-window" ).hasClass( "buttons-hidden" ),
		"Window buttons are not hidden by default"
	);
	run( () => set( this.subject, "settings.gui.hidebuttons", true ) );
	assert.ok(
		getElem( this.subject, ".buttons-window" ).hasClass( "buttons-hidden" ),
		"Window buttons are now hidden"
	);

	assert.ok(
		getElem( this.subject, ".buttons-debug" ).hasClass( "hidden" ),
		"Debug buttons are hidden in non-debug-mode"
	);
	run( () => set( this.subject, "isDebug", true ) );
	assert.notOk(
		getElem( this.subject, ".buttons-debug" ).hasClass( "hidden" ),
		"Debug buttons are not hidden in debug-mode"
	);

	getElem( this.subject, ".btn-settings" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "settings" ],
		"Clicking the settings button redirects to the settings menu"
	);

	getElem( this.subject, ".btn-watching" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "watching" ],
		"Clicking the watching button redirects to the watching menu"
	);
	assert.ok(
		getElem( this.subject, ".btn-watching" ).hasClass( "btn-hidden" ),
		"The watching button is hidden while not watching any streams"
	);
	run( () => set( this.subject, "streaming.model.length", 1 ) );
	assert.notOk(
		getElem( this.subject, ".btn-watching" ).hasClass( "btn-hidden" ),
		"The watching button is visible while watching streams"
	);
	assert.strictEqual(
		getElem( this.subject, ".btn-watching .indicator" ).text(),
		"1",
		"The watching button's indicator is showing the number of streams being watched"
	);

	assert.ok(
		getElem( this.subject, ".btn-user" ).length,
		"Does have a user button while being logged in"
	);
	assert.notOk(
		getElem( this.subject, ".btn-no-user" ).length,
		"Does not have a no-user button while being logged in"
	);

	assert.strictEqual(
		getElem( this.subject, ".btn-user" ).attr( "title" ),
		"Logged in as user\nNotifications are enabled",
		"The user button does have the correct title while being logged in"
	);

	assert.ok(
		getElem( this.subject, ".btn-user .indicator" ).length,
		"The user button has an indicator while notifications are enabled"
	);
	assert.notOk(
		getElem( this.subject, ".btn-user .indicator" ).hasClass( "indicator-disabled" ),
		"The user button's indicator is not disabled while notifications are not paused"
	);
	assert.notOk(
		getElem( this.subject, ".btn-user .indicator" ).hasClass( "indicator-error" ),
		"The user button's indicator is not showing an error when notifications are working"
	);

	run( () => set( this.subject, "notification.error", true ) );
	assert.ok(
		getElem( this.subject, ".btn-user .indicator" ).hasClass( "indicator-error" ),
		"The user button's indicator is showing an error when notifications are not working"
	);

	run( () => set( this.subject, "notification.paused", true ) );
	assert.ok(
		getElem( this.subject, ".btn-user .indicator" ).hasClass( "indicator-disabled" ),
		"The user button's indicator is disabled while notifications are paused"
	);
	assert.notOk(
		getElem( this.subject, ".btn-user .indicator" ).hasClass( "indicator-error" ),
		"The user button's indicator is not showing an error when notifications are paused"
	);

	run( () => set( this.subject, "notification.enabled", false ) );
	assert.notOk(
		getElem( this.subject, ".btn-user" ).hasClass( "btn-indicator" ),
		"The user button does not have an indicator while notifications are disabled"
	);
	assert.notOk(
		getElem( this.subject, ".btn-user .indicator" ).length,
		"The user button does not have an indicator while notifications are disabled"
	);

	assert.notOk(
		getElem( this.subject, ".btn-user" ).hasClass( "btn-user-pending" ),
		"The user button is not in a pending state intially"
	);
	run( () => set( this.subject, "auth.session.isPending", true ) );
	assert.ok(
		getElem( this.subject, ".btn-user" ).hasClass( "btn-user-pending" ),
		"The user button is in a pending state now"
	);

	getElem( this.subject, ".btn-user" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "user.index" ],
		"Clicking the user button redirects to the user index route"
	);

	run( () => set( this.subject, "auth.session.isLoggedIn", false ) );
	assert.notOk(
		getElem( this.subject, ".btn-user" ).length,
		"Does not have a user button while being logged out"
	);
	assert.ok(
		getElem( this.subject, ".btn-no-user" ).length,
		"Does have a no-user button while being logged out"
	);

	assert.strictEqual(
		getElem( this.subject, ".btn-no-user" ).attr( "title" ),
		"You're not logged in",
		"The no-user button does have the correct title while not being logged in"
	);

	getElem( this.subject, ".btn-no-user" ).click();
	assert.propEqual(
		this.routingTransitionToSpy.lastCall.args,
		[ "user.index" ],
		"Clicking the no-user button redirects to the user index route"
	);

});
