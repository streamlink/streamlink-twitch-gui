import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import sinon from "sinon";
import { run } from "@ember/runloop";
import Adapter from "ember-data/adapter";
import { EventEmitter } from "events";

import Window from "data/models/window/model";
import resetWindowInjector from "inject-loader!nwjs/Window/reset";
import windowInitializerInjector
// eslint-disable-next-line max-len
	from "inject-loader?config&nwjs/Window&nwjs/Window/reset&nwjs/Screen&utils/node/platform!init/instance-initializers/nwjs/window";


module( "init/instance-initializers/nwjs/window", {
	beforeEach() {
		this.owner = buildOwner();
		this.env = setupStore( this.owner );

		this.fakeTimer = sinon.useFakeTimers({
			//toFake: [ "Date", "setTimeout", "clearTimeout" ],
			target: window
		});

		const manifest = {
			window: {
				width: 960,
				height: 540
			}
		};

		const nwWindow = new EventEmitter();
		nwWindow.x = 0;
		nwWindow.y = 0;
		nwWindow.width = manifest.window.width;
		nwWindow.height = manifest.window.height;
		nwWindow.maximize = () => {
			nwWindow.emit( "maximize" );
		};
		nwWindow.minimize = () => {
			nwWindow.emit( "minimize" );
		};
		nwWindow.restore = () => {
			nwWindow.emit( "restore" );
		};
		nwWindow.moveTo = ( x, y ) => {
			nwWindow.x = x;
			nwWindow.y = y;
			nwWindow.emit( "move", x, y );
		};
		nwWindow.resizeTo = ( width, height ) => {
			nwWindow.width = width;
			nwWindow.height = height;
			nwWindow.emit( "resize", width, height );
		};

		const nwScreen = new EventEmitter();
		nwScreen.screens = [
			{
				bounds: {
					x: 0,
					y: 0,
					width: 1920,
					height: 1080
				}
			},
			{
				bounds: {
					x: 1920,
					y: 0,
					width: 1920,
					height: 1080
				}
			}
		];

		this.nwWindow = nwWindow;
		this.nwScreen = nwScreen;

		this.saveStub = sinon.stub().callsFake( async function() {
			return this;
		});
		this.owner.register( "model:window", Window.extend({
			save: this.saveStub
		}) );

		const { default: resetWindow } = resetWindowInjector({
			"nwjs/App": { manifest },
			"nwjs/Window": nwWindow,
			"nwjs/Screen": nwScreen
		});

		this.subject = async ( findAll, isWin = false ) => {
			this.findAllStub = sinon.stub().callsFake( async () => findAll ? [ findAll ] : [] );

			this.owner.register( "adapter:window", Adapter.extend({
				findAll: this.findAllStub
			}) );

			const { default: windowInitializer } = windowInitializerInjector({
				"config": {
					"vars": {
						"time-window-event-debounce": 1000,
						"time-window-event-ignore": 2000
					}
				},
				"nwjs/Window": nwWindow,
				"nwjs/Window/reset": resetWindow,
				"nwjs/Screen": nwScreen,
				"utils/node/platform": { isWin }
			});
			await windowInitializer( this.owner );
		};
	},

	afterEach() {
		runDestroy( this.owner );
		this.owner = this.env = this.nwWindow = this.nwScreen = null;
		this.fakeTimer.restore();
	}
});


test( "Non-existing window record", async function( assert ) {

	await this.subject();

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: null,
			y: null,
			width: null,
			height: null,
			maximized: false
		},
		"A window record has been created"
	);

	assert.strictEqual( this.nwWindow.x, 0, "x property has not been updated" );
	assert.strictEqual( this.nwWindow.y, 0, "y property has not been updated" );
	assert.strictEqual( this.nwWindow.width, 960, "width property has not been updated" );
	assert.strictEqual( this.nwWindow.height, 540, "height property has not been updated" );

});


test( "Existing window record with postition on first screen", async function( assert ) {

	const maximizeSpy = sinon.spy();
	const restoreSpy = sinon.spy();
	this.nwWindow.on( "maximize", maximizeSpy );
	this.nwWindow.on( "restore", restoreSpy );

	await this.subject({
		id: "1",
		x: 100,
		y: 100,
		width: 1440,
		height: 810,
		maximized: false
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );
	assert.notOk( maximizeSpy.called, "Doesn't call maximize" );
	assert.notOk( restoreSpy.called, "Doesn't call restore" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 100,
			y: 100,
			width: 1440,
			height: 810,
			maximized: false
		},
		"A window record with id 1 exists"
	);

	assert.strictEqual( this.nwWindow.x, 100, "x property has been updated" );
	assert.strictEqual( this.nwWindow.y, 100, "y property has been updated" );
	assert.strictEqual( this.nwWindow.width, 1440, "width property has been updated" );
	assert.strictEqual( this.nwWindow.height, 810, "height property has been updated" );

	// move window off the screen
	run( () => this.nwWindow.moveTo( 481, 271 ) );

	// wait for the debounce time of the move event
	this.fakeTimer.tick( 1000 );

	assert.ok( this.saveStub.notCalled, "Doesn't update record if moved off the screen" );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 100,
			y: 100,
			width: 1440,
			height: 810,
			maximized: false
		},
		"The window record doesn't get updated if moved off the screen"
	);

	assert.strictEqual( this.nwWindow.x, 481, "x property has been updated" );
	assert.strictEqual( this.nwWindow.y, 271, "y property has been updated" );
	assert.strictEqual( this.nwWindow.width, 1440, "width property has been updated" );
	assert.strictEqual( this.nwWindow.height, 810, "height property has been updated" );

	// resize window so that parts of it are off the screen
	run( () => {
		this.nwWindow.x = this.nwWindow.y = 100;
		this.nwWindow.resizeTo( 1920, 1080 );
	});

	// wait for the debounce time of the resize event
	this.fakeTimer.tick( 1000 );

	assert.ok( this.saveStub.notCalled, "Doesn't update record if resized off the screen" );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 100,
			y: 100,
			width: 1440,
			height: 810,
			maximized: false
		},
		"The window record doesn't get updated if resized off the screen"
	);

	assert.strictEqual( this.nwWindow.x, 100, "x property has been updated" );
	assert.strictEqual( this.nwWindow.y, 100, "y property has been updated" );
	assert.strictEqual( this.nwWindow.width, 1920, "width property has been updated" );
	assert.strictEqual( this.nwWindow.height, 1080, "height property has been updated" );

});


test( "Existing window record with position on second screen", async function( assert ) {

	const maximizeSpy = sinon.spy();
	const restoreSpy = sinon.spy();
	this.nwWindow.on( "maximize", maximizeSpy );
	this.nwWindow.on( "restore", restoreSpy );

	await this.subject({
		id: "1",
		x: 2020,
		y: 100,
		width: 1440,
		height: 810,
		maximized: true
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );
	assert.ok( maximizeSpy.calledOnce, "Calls maximize once" );
	assert.notOk( restoreSpy.called, "Doesn't call restore" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 2020,
			y: 100,
			width: 1440,
			height: 810,
			maximized: true
		},
		"A window record with id 1 exists"
	);

	assert.strictEqual( this.nwWindow.x, 2020, "x property has been updated" );
	assert.strictEqual( this.nwWindow.y, 100, "y property has been updated" );
	assert.strictEqual( this.nwWindow.width, 1440, "width property has been updated" );
	assert.strictEqual( this.nwWindow.height, 810, "height property has been updated" );

	// remove second screen (window is now out of bounds)
	const secondScreen = this.nwScreen.screens.pop();

	// require all three events to be triggered after triggering displayBoundsChanged
	let resolveMove, resolveResize;
	const promise = Promise.all([
		new Promise( r => resolveMove = r ),
		new Promise( r => resolveResize = r )
	]);
	const moveStub = sinon.stub().callsFake( resolveMove );
	const resizeStub = sinon.stub().callsFake( resolveResize );
	this.nwWindow.once( "move", moveStub );
	this.nwWindow.once( "resize", resizeStub );

	run( () => this.nwScreen.emit( "displayBoundsChanged" ) );
	await promise;
	assert.ok( moveStub.calledOnce, "Emits move event once" );
	assert.ok( resizeStub.calledOnce, "Emits resize event once" );

	assert.notOk( this.saveStub.called, "Hasn't called updateRecord yet" );

	// wait for the debounce time of the events
	this.fakeTimer.tick( 1000 );

	assert.ok( this.saveStub.calledTwice, "Has called updateRecord twice (resize+move)" );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: true
		},
		"Resets the window record if the screens change and the window is out of bounds"
	);

	assert.strictEqual( this.nwWindow.x, 480, "x property has been reset" );
	assert.strictEqual( this.nwWindow.y, 270, "y property has been reset" );
	assert.strictEqual( this.nwWindow.width, 960, "width property has been reset" );
	assert.strictEqual( this.nwWindow.height, 540, "height property has been reset" );

	this.saveStub.resetHistory();

	// move window between two screens
	this.nwScreen.screens.push( secondScreen );
	this.nwWindow.x = 1440;
	run( () => this.nwWindow.emit( "move", this.nwWindow.x, this.nwWindow.y ) );

	// wait for the debounce time of the move event
	this.fakeTimer.tick( 1000 );

	assert.notOk( this.saveStub.called, "Hasn't called updateRecord" );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: true
		},
		"Doesn't upgrade the window record if the windows gets moved between two screens"
	);

	assert.strictEqual( this.nwWindow.x, 1440, "x property has been set" );
	assert.strictEqual( this.nwWindow.y, 270, "y property has been set" );
	assert.strictEqual( this.nwWindow.width, 960, "width property has been set" );
	assert.strictEqual( this.nwWindow.height, 540, "height property has been set" );

});


test( "Existing window record with position off screen", async function( assert ) {

	const maximizeSpy = sinon.spy();
	const restoreSpy = sinon.spy();
	this.nwWindow.on( "maximize", maximizeSpy );
	this.nwWindow.on( "restore", restoreSpy );

	await this.subject({
		id: "1",
		x: -10000,
		y: -10000,
		width: 1920,
		height: 1080,
		maximized: true
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );
	assert.ok( maximizeSpy.calledOnce, "Calls maximize once" );
	assert.notOk( restoreSpy.called, "Doesn't call restore" );

	assert.notOk( this.saveStub.called, "Hasn't called updateRecord" );

	// wait for the debounce time of the events
	this.fakeTimer.tick( 2000 );

	assert.ok( this.saveStub.calledTwice, "Has called updateRecord twice (move+resize)" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: true
		},
		"Resets the window record when resetting the application window"
	);

	assert.strictEqual( this.nwWindow.x, 480, "x property has been updated" );
	assert.strictEqual( this.nwWindow.y, 270, "y property has been updated" );
	assert.strictEqual( this.nwWindow.width, 960, "width property has been updated" );
	assert.strictEqual( this.nwWindow.height, 540, "height property has been updated" );

});


test( "Maximize and restore", async function( assert ) {

	await this.subject({
		id: "1",
		x: 480,
		y: 270,
		width: 960,
		height: 540,
		maximized: false
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );

	run( () => this.nwWindow.maximize() );

	assert.ok( this.saveStub.calledOnce, "Updates window record on maximize" );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: true
		},
		"Saves maximized state on maximize"
	);

	this.saveStub.resetHistory();
	run( () => this.nwWindow.restore() );

	assert.ok( this.saveStub.calledOnce, "Updates window record on restore" );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: false
		},
		"Saves maximized state on restore"
	);

});


test( "Debounce events", async function( assert ) {

	await this.subject({
		id: "1",
		x: 480,
		y: 270,
		width: 960,
		height: 540,
		maximized: false
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );

	for ( let i = 0; i < 3; i++ ) {
		run( () => {
			this.nwWindow.emit( "move", 0, 0 );
			this.nwWindow.emit( "resize", 1920, 1080 );
		});
		this.fakeTimer.tick( 999 );
	}

	assert.notOk( this.saveStub.called, "Hasn't called updateRecord yet" );
	this.fakeTimer.tick( 1 );
	assert.ok( this.saveStub.calledTwice, "Has called updateRecord twice (move+resize)" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 0,
			y: 0,
			width: 1920,
			height: 1080,
			maximized: false
		},
		"Updates the window record only once for each event type"
	);

});


test( "Ignore events on minimize", async function( assert ) {

	await this.subject({
		id: "1",
		x: 480,
		y: 270,
		width: 960,
		height: 540,
		maximized: false
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );

	// minimize
	run( () => this.nwWindow.minimize() );
	assert.notOk( this.saveStub.called, "Hasn't called updateRecord yet" );

	// those events will be ignored
	run( () => {
		this.nwWindow.emit( "move", 0, 0 );
		this.nwWindow.emit( "resize", 1920, 1080 );
	});
	this.fakeTimer.tick( 1000 );
	assert.notOk( this.saveStub.called, "Hasn't called updateRecord yet" );

	// these events won't be ignored
	run( () => {
		this.nwWindow.emit( "move", 0, 0 );
		this.nwWindow.emit( "resize", 1920, 1080 );
	});
	this.fakeTimer.tick( 1000 );
	assert.ok( this.saveStub.calledTwice, "Has called updateRecord twice" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 0,
			y: 0,
			width: 1920,
			height: 1080,
			maximized: false
		},
		"Updates the window record only after the event ignore time expires"
	);

});


test( "Ignore events on maximize", async function( assert ) {

	await this.subject({
		id: "1",
		x: 480,
		y: 270,
		width: 960,
		height: 540,
		maximized: false
	});

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );

	// maximize (calls updateRecord() separately)
	run( () => this.nwWindow.maximize() );
	assert.ok( this.saveStub.calledOnce, "Has called updateRecord once" );

	// those events will be ignored
	run( () => {
		this.nwWindow.emit( "move", 0, 0 );
		this.nwWindow.emit( "resize", 1920, 1080 );
	});
	this.fakeTimer.tick( 1000 );
	assert.ok( this.saveStub.calledOnce, "Has called updateRecord still once" );

	// these events won't be ignored
	run( () => {
		this.nwWindow.emit( "move", 0, 0 );
		this.nwWindow.emit( "resize", 1920, 1080 );
	});
	this.fakeTimer.tick( 1000 );
	assert.ok( this.saveStub.calledThrice, "Has called updateRecord thrice" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );
	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 0,
			y: 0,
			width: 1920,
			height: 1080,
			maximized: true
		},
		"Updates the window record only after the event ignore time expires"
	);

});


test( "Special window coordinates on Windows", async function( assert ) {

	this.nwScreen.screens = [
		{
			bounds: {
				x: -64000,
				y: -64000,
				width: 128000,
				height: 128000
			}
		}
	];

	await this.subject({
		id: "1",
		x: 480,
		y: 270,
		width: 960,
		height: 540,
		maximized: false
	}, true );

	assert.ok( this.findAllStub.calledOnce, "Calls findAll once" );

	const windowRecord = this.env.store.peekRecord( "window", 1 );

	run( () => {
		this.nwWindow.x = -8;
		this.nwWindow.y = -8;
		this.nwWindow.emit( "move", this.nwWindow.x, this.nwWindow.y );
	});

	this.fakeTimer.tick( 1000 );

	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: false
		},
		"Doesn't update the window record"
	);

	run( () => {
		this.nwWindow.x = -32000;
		this.nwWindow.y = -32000;
		this.nwWindow.emit( "move", this.nwWindow.x, this.nwWindow.y );
	});

	this.fakeTimer.tick( 1000 );

	assert.propEqual(
		windowRecord.toJSON({ includeId: true }),
		{
			id: "1",
			x: 480,
			y: 270,
			width: 960,
			height: 540,
			maximized: false
		},
		"Doesn't update the window record"
	);

});
