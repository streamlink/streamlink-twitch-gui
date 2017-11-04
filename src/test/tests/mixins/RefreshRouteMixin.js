import {
	module,
	test
} from "qunit";
import {
	runDestroy,
	buildOwner
} from "test-utils";
import {
	set,
	setOwner,
	sendEvent,
	computed,
	run,
	EmberObject,
	Service
} from "ember";
import refreshRouteMixinInjector from "inject-loader?nwjs/Window!mixins/RefreshRouteMixin";
import { EventEmitter } from "events";


const nwWindow = new EventEmitter();
const {
	"default": RefreshRouteMixin,
	PROP_LAST,
	PROP_DEFER
} = refreshRouteMixinInjector({
	"nwjs/Window": nwWindow
});


let dateNow;
let owner;


module( "mixins/RefreshRouteMixin", {
	beforeEach() {
		dateNow = Date.now;
		owner = buildOwner();
	},
	afterEach() {
		runDestroy( owner );
		owner = null;
		Date.now = dateNow;
	}
});


test( "Application window focus gain", assert => {

	let threshold = 10;
	let refreshes = 0;

	const ModalService = Service.extend({
		isModalOpened: false
	});
	const SettingsService = Service.extend({
		gui: {
			focusrefresh: computed(function() {
				return threshold;
			}).volatile()
		}
	});
	const route = EmberObject.extend( RefreshRouteMixin, {
		_refreshOnFocusGain() {
			this._refreshFocusGain();
		},
		_refreshOnFocusLoss() {
			this._refreshFocusLoss();
		},
		refresh() {
			++refreshes;
			return this._super( ...arguments );
		}
	}).create();

	owner.register( "service:modal", ModalService );
	owner.register( "service:settings", SettingsService );
	setOwner( route, owner );


	// initial

	assert.ok(
		!route.hasOwnProperty( PROP_LAST ) && !route.hasOwnProperty( PROP_DEFER ),
		"Does not have refresh properties set unless activated"
	);


	// entering the route

	sendEvent( route, "activate" );

	assert.ok(
		route.hasOwnProperty( PROP_LAST ) && route.hasOwnProperty( PROP_DEFER ),
		"Does have refresh properties set after being activated"
	);
	assert.deepEqual(
		nwWindow.eventNames(),
		[ "focus", "restore", "blur", "minimize" ],
		"The nwWindow object has all required events registered"
	);

	nwWindow.emit( "focus" );
	nwWindow.emit( "restore" );
	assert.strictEqual(
		refreshes,
		0,
		"Doesn't refresh on focus/restore while still being focused"
	);


	// refresh route when regaining focus

	Date.now = () => 100;
	nwWindow.emit( "blur" );
	assert.strictEqual( route[ PROP_LAST ], 100, "Remembers time on focus loss" );

	Date.now = () => 109;
	nwWindow.emit( "focus" );
	assert.strictEqual( refreshes, 0, "Doesn't refresh when time diff is smaller than threshold" );

	Date.now = () => 100;
	nwWindow.emit( "minimize" );
	assert.strictEqual( route[ PROP_LAST ], 100, "Remembers time when getting minimized" );

	Date.now = () => 110;
	nwWindow.emit( "restore" );
	assert.strictEqual( refreshes, 1, "Refreshes when time diff is gte threshold" );

	threshold = 0;
	refreshes = 0;

	Date.now = () => 100;
	nwWindow.emit( "blur" );
	Date.now = () => 110;
	nwWindow.emit( "focus" );
	assert.strictEqual( refreshes, 0, "Doesn't refresh when threshold is zero" );


	// opened modal dialog

	function regainFocusWithModalDialog() {
		threshold = 10;
		refreshes = 0;
		run( () => set( route, "modal.isModalOpened", true ) );

		Date.now = () => 100;
		nwWindow.emit( "blur" );
		Date.now = () => 110;
		nwWindow.emit( "focus" );
	}

	regainFocusWithModalDialog();
	assert.strictEqual( refreshes, 0, "Doesn't refresh when modal is opened" );
	assert.strictEqual( route[ PROP_DEFER ], true, "Defers route refresh when modal is opened" );

	run( () => set( route, "modal.isModalOpened", false ) );
	assert.strictEqual( refreshes, 1, "Refreshes when modal gets closed" );
	assert.strictEqual( route[ PROP_DEFER ], false, "Doen't defer events when modal closes" );

	regainFocusWithModalDialog();
	route.refresh();
	assert.strictEqual( route[ PROP_DEFER ], false, "Doesn't defer events after refreshing" );

	regainFocusWithModalDialog();


	// leaving the route

	sendEvent( route, "deactivate" );

	assert.ok(
		!route.hasOwnProperty( PROP_LAST ) && !route.hasOwnProperty( PROP_DEFER ),
		"Does not have refresh properties set anymore after being deactivated"
	);
	assert.deepEqual(
		nwWindow.eventNames(),
		[],
		"The nwWindow object doesn't have any events registered anymore after deactivating"
	);

	run( () => set( route, "modal.isModalOpened", false ) );

	assert.strictEqual( refreshes, 0, "Doesn't try to refresh when modal closes after leaving" );

});
