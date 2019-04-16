import { module, test } from "qunit";
import { runDestroy, buildOwner } from "test-utils";
import { default as EmberObject, set } from "@ember/object";
import { sendEvent } from "@ember/object/events";
import Service from "@ember/service";
import { EventEmitter } from "events";
import sinon from "sinon";

import refreshMixinInjector from "inject-loader?nwjs/Window!ui/routes/-mixins/routes/refresh";


const { hasOwnProperty } = {};


module( "ui/routes/-mixins/routes/refresh", {
	beforeEach() {
		this.clock = sinon.useFakeTimers({
			target: window
		});
		this.events = new EventEmitter();

		this.threshold = 1000;
		this.refreshes = 0;

		const {
			default: RefreshMixin,
			PROP_LAST,
			PROP_DEFER,
			TIME_DEBOUNCE
		} = refreshMixinInjector({
			"nwjs/Window": {
				__esModule: true,
				default: this.events,
				window
			}
		});

		this.PROP_LAST = PROP_LAST;
		this.PROP_DEFER = PROP_DEFER;
		this.TIME_DEBOUNCE = TIME_DEBOUNCE;

		const testContext = this;
		const ModalService = Service.extend({
			isModalOpened: false
		});
		const SettingsService = Service.extend({
			gui: EmberObject.extend({
				get focusrefresh() {
					return testContext.threshold;
				}
			}).create()
		});
		const Route = EmberObject.extend( RefreshMixin );

		this.owner = buildOwner();
		this.owner.register( "service:modal", ModalService );
		this.owner.register( "service:settings", SettingsService );
		this.owner.register( "route:route", Route );

		this.subject = this.owner.lookup( "route:route" );

		this.refreshSpy = sinon.spy( this.subject, "refresh" );
	},

	afterEach() {
		this.clock.restore();
		runDestroy( this.owner );
	}
});


test( "Activate", function( assert ) {

	const { subject, events, PROP_LAST, PROP_DEFER } = this;

	assert.notOk(
		   hasOwnProperty.call( subject, PROP_LAST )
		|| hasOwnProperty.call( subject, PROP_DEFER ),
		"Does not have refresh properties set unless activated"
	);

	sendEvent( subject, "activate" );
	assert.ok(
		   hasOwnProperty.call( subject, PROP_LAST )
		&& hasOwnProperty.call( subject, PROP_DEFER ),
		"Does have refresh properties set after being activated"
	);
	assert.propEqual(
		events.eventNames(),
		[ "focus", "restore", "blur", "minimize" ],
		"All required events are registered"
	);

	subject[ PROP_LAST ] = 123;
	sendEvent( subject, "activate" );
	assert.strictEqual( subject[ PROP_LAST ], 123, "Doesn't initialize twice" );

});


test( "Debounce events", function( assert ) {

	const { subject, events, clock, TIME_DEBOUNCE } = this;

	const onFocusGain = sinon.stub( subject, "_refreshOnFocusGain" );
	const onFocusLoss = sinon.stub( subject, "_refreshOnFocusLoss" );

	sendEvent( subject, "activate" );

	// single focus event
	clock.setSystemTime( 0 );
	events.emit( "focus" );
	clock.tick( TIME_DEBOUNCE - 1 );
	assert.notOk( onFocusGain.called, "Hasn't called onFocusGain yet" );
	clock.tick( 1 );
	assert.ok( onFocusGain.called, "Has called onFocusGain now" );
	onFocusGain.resetHistory();

	// single restore event
	clock.setSystemTime( 0 );
	events.emit( "restore" );
	clock.tick( TIME_DEBOUNCE - 1 );
	assert.notOk( onFocusGain.called, "Hasn't called onFocusGain yet" );
	clock.tick( 1 );
	assert.ok( onFocusGain.called, "Has called onFocusGain now" );
	onFocusGain.resetHistory();

	// single blur event
	clock.setSystemTime( 0 );
	events.emit( "blur" );
	clock.tick( TIME_DEBOUNCE - 1 );
	assert.notOk( onFocusLoss.called, "Hasn't called onFocusLoss yet" );
	clock.tick( 1 );
	assert.ok( onFocusLoss.called, "Has called onFocusLoss now" );
	onFocusLoss.resetHistory();

	// single minimize event
	clock.setSystemTime( 0 );
	events.emit( "minimize" );
	clock.tick( TIME_DEBOUNCE - 1 );
	assert.notOk( onFocusLoss.called, "Hasn't called onFocusLoss yet" );
	clock.tick( 1 );
	assert.ok( onFocusLoss.called, "Has called onFocusLoss now" );
	onFocusLoss.resetHistory();

	// focus and restore events
	clock.setSystemTime( 0 );
	events.emit( "focus" );
	clock.tick( TIME_DEBOUNCE - 1 );
	events.emit( "restore" );
	clock.tick( TIME_DEBOUNCE - 1 );
	assert.notOk( onFocusGain.called, "Hasn't called onFocusGain yet" );
	clock.tick( 1 );
	assert.ok( onFocusGain.called, "Has called onFocusGain now" );
	onFocusGain.resetHistory();

	// blur and minimize events
	clock.setSystemTime( 0 );
	events.emit( "blur" );
	clock.tick( TIME_DEBOUNCE - 1 );
	events.emit( "minimize" );
	clock.tick( TIME_DEBOUNCE - 1 );
	assert.notOk( onFocusLoss.called, "Hasn't called onFocusLoss yet" );
	clock.tick( 1 );
	assert.ok( onFocusLoss.called, "Has called onFocusLoss now" );
	onFocusLoss.resetHistory();

});


test( "Refresh", function( assert ) {

	const { subject, events, clock, TIME_DEBOUNCE, PROP_LAST } = this;

	assert.ok( this.threshold > TIME_DEBOUNCE, "Threshold is greater than debounce time" );

	sendEvent( subject, "activate" );

	events.emit( "focus" );
	events.emit( "restore" );
	clock.tick( TIME_DEBOUNCE );
	assert.notOk( this.refreshSpy.called, "Doesn't refresh on focus/restore without focus loss" );

	// blur
	this.refreshSpy.resetHistory();
	clock.setSystemTime( 0 );
	events.emit( "blur" );
	clock.tick( TIME_DEBOUNCE );
	assert.strictEqual( subject[ PROP_LAST ], TIME_DEBOUNCE, "Remembers blur time" );

	// focus too early
	clock.setSystemTime( this.threshold - 1 );
	events.emit( "focus" );
	clock.tick( TIME_DEBOUNCE );
	assert.notOk( this.refreshSpy.called, "Doesn't refresh when focused too early" );

	// focus
	clock.setSystemTime( this.threshold );
	events.emit( "focus" );
	clock.tick( TIME_DEBOUNCE );
	assert.ok( this.refreshSpy.calledOnce, "Refreshes once focus threshold has been reached" );

	// minimize
	this.refreshSpy.resetHistory();
	clock.setSystemTime( 0 );
	events.emit( "minimize" );
	clock.tick( TIME_DEBOUNCE );
	assert.strictEqual( subject[ PROP_LAST ], TIME_DEBOUNCE, "Remembers minimize time" );

	// restore too early
	clock.setSystemTime( this.threshold - 1 );
	events.emit( "restore" );
	clock.tick( TIME_DEBOUNCE );
	assert.notOk( this.refreshSpy.called, "Doesn't refresh when restored too early" );

	// restore
	clock.setSystemTime( this.threshold );
	events.emit( "restore" );
	clock.tick( TIME_DEBOUNCE );
	assert.ok( this.refreshSpy.calledOnce, "Refreshes once restore threshold has been reached" );

	// disable refresh logic
	this.refreshSpy.resetHistory();
	clock.setSystemTime( 0 );
	this.threshold = 0;
	events.emit( "blur" );
	clock.tick( TIME_DEBOUNCE );
	events.emit( "focus" );
	clock.tick( TIME_DEBOUNCE );
	assert.notOk( this.refreshSpy.called, "Doesn't refresh when threshold is zero" );

});


test( "Modal dialog", function( assert ) {

	const { subject, events, clock, threshold, TIME_DEBOUNCE, PROP_DEFER } = this;

	sendEvent( subject, "activate" );

	function regainFocusWithModalDialog() {
		clock.setSystemTime( 0 );
		set( subject, "modal.isModalOpened", true );

		events.emit( "blur" );
		clock.tick( TIME_DEBOUNCE );
		clock.tick( threshold );
		events.emit( "focus" );
		clock.tick( TIME_DEBOUNCE );
	}

	regainFocusWithModalDialog();
	assert.notOk( this.refreshSpy.called, "Doesn't refresh if modal is opened" );
	assert.strictEqual( subject[ PROP_DEFER ], true, "Defers refresh if modal is opened" );

	set( subject, "modal.isModalOpened", false );
	assert.ok( this.refreshSpy.calledOnce, "Refreshes when modal gets closed" );
	assert.strictEqual( subject[ PROP_DEFER ], false, "Doesn't defer after closing the modal" );

	regainFocusWithModalDialog();
	subject.refresh();
	this.refreshSpy.resetHistory();
	assert.strictEqual( subject[ PROP_DEFER ], false, "Doesn't defer after refreshing" );
	set( subject, "modal.isModalOpened", false );
	assert.notOk( this.refreshSpy.called, "Doesn't refresh when modal gets closed afterwards" );

});


test( "Deactivate", function( assert ) {

	const { subject, events, PROP_LAST, PROP_DEFER } = this;

	set( subject, "modal.isModalOpened", true );
	sendEvent( subject, "activate" );
	sendEvent( subject, "deactivate" );

	assert.ok(
		   !hasOwnProperty.call( subject, PROP_LAST )
		&& !hasOwnProperty.call( subject, PROP_DEFER ),
		"Does not have refresh properties set anymore after being deactivated"
	);
	assert.propEqual( events.eventNames(), [], "Unregisters events when deactivating route" );

	set( subject, "modal.isModalOpened", false );
	assert.notOk( this.refreshSpy.called, "Doesn't refresh when modal closes" );

});
