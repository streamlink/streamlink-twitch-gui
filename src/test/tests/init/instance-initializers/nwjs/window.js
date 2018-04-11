import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import Adapter from "ember-data/adapter";
import { EventEmitter } from "events";

import Window from "data/models/window/model";
import resetWindowInjector from "inject-loader!nwjs/Window/reset";
import windowInitializerInjector
// eslint-disable-next-line max-len
	from "inject-loader?config&nwjs/Window&nwjs/Window/reset&nwjs/Screen&utils/node/platform!init/instance-initializers/nwjs/window";


let owner, env;

const manifest = {
	window: {
		width: 960,
		height: 540
	}
};
let nwWindow, nwScreen;


module( "init/instance-initializers/nwjs/window", {
	beforeEach() {
		owner = buildOwner();
		owner.register( "model:window", Window );

		env = setupStore( owner );

		nwWindow = new EventEmitter();
		nwWindow.x = 0;
		nwWindow.y = 0;
		nwWindow.width = manifest.window.width;
		nwWindow.height = manifest.window.height;
		nwWindow.maximize = () => {
			nwWindow.emit( "maximize" );
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

		nwScreen = new EventEmitter();
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
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "No existing window record", async assert => {

	assert.expect( 7 );

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [];
		},
		async createRecord() {
			assert.ok( true, "Calls adapter.createRecord()" );
			return { id: 1 };
		}
	}) );

	const { default: windowInitializer } = windowInitializerInjector({
		"config": { vars: {} },
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": () => {
			throw new Error();
		},
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: false
		}
	});

	await windowInitializer( owner );

	const windowRecord = env.store.peekRecord( "window", 1 );
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

	assert.strictEqual( nwWindow.x, 0, "nwWindow's x property has not been updated" );
	assert.strictEqual( nwWindow.y, 0, "nwWindow's y property has not been updated" );
	assert.strictEqual( nwWindow.width, 960, "nwWindow's width property has not been updated" );
	assert.strictEqual( nwWindow.height, 540, "nwWindow's height property has not been updated" );

});


test( "Existing window record with postition on first screen", async assert => {

	assert.expect( 16 );

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [{
				id: "1",
				x: 100,
				y: 100,
				width: 1440,
				height: 810,
				maximized: false
			}];
		}
	}) );

	const { default: windowInitializer } = windowInitializerInjector({
		"config": {
			vars: {
				"time-window-event-debounce": 1,
				"time-window-event-ignore": 1
			}
		},
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": () => {
			throw new Error();
		},
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: false
		}
	});

	await windowInitializer( owner );

	const windowRecord = env.store.peekRecord( "window", 1 );
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

	assert.strictEqual( nwWindow.x, 100, "nwWindow's x property has been updated" );
	assert.strictEqual( nwWindow.y, 100, "nwWindow's y property has been updated" );
	assert.strictEqual( nwWindow.width, 1440, "nwWindow's width property has been updated" );
	assert.strictEqual( nwWindow.height, 810, "nwWindow's height property has been updated" );

	// move window off the screen
	nwWindow.moveTo( 481, 271 );

	// wait for the debounce time of the move event
	await new Promise( resolve => setTimeout( resolve, 2 ) );

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

	assert.strictEqual( nwWindow.x, 481, "nwWindow's x property has been updated" );
	assert.strictEqual( nwWindow.y, 271, "nwWindow's y property has been updated" );
	assert.strictEqual( nwWindow.width, 1440, "nwWindow's width property has been updated" );
	assert.strictEqual( nwWindow.height, 810, "nwWindow's height property has been updated" );

	// resize window so that parts of it are off the screen
	nwWindow.x = nwWindow.y = 100;
	nwWindow.resizeTo( 1920, 1080 );

	// wait for the debounce time of the resize event
	await new Promise( resolve => setTimeout( resolve, 2 ) );

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

	assert.strictEqual( nwWindow.x, 100, "nwWindow's x property has been updated" );
	assert.strictEqual( nwWindow.y, 100, "nwWindow's y property has been updated" );
	assert.strictEqual( nwWindow.width, 1920, "nwWindow's width property has been updated" );
	assert.strictEqual( nwWindow.height, 1080, "nwWindow's height property has been updated" );

});


test( "Existing window record with position on second screen", async assert => {

	assert.expect( 21 );

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [{
				id: "1",
				x: 2020,
				y: 100,
				width: 1440,
				height: 810,
				maximized: true
			}];
		},
		async updateRecord() {
			assert.ok( true, "Calls adapter.updateRecord()" );
		}
	}) );

	const resetWindow = resetWindowInjector({
		"nwjs/App": { manifest },
		"nwjs/Window": nwWindow,
		"nwjs/Screen": nwScreen
	})[ "default" ];

	const { default: windowInitializer } = windowInitializerInjector({
		"config": {
			vars: {
				"time-window-event-debounce": 1,
				"time-window-event-ignore": 1
			}
		},
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": resetWindow,
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: false
		}
	});

	nwWindow.on( "maximize", () => {
		assert.ok( true, "Calls nwWindow.maximize() once" );
	});

	nwWindow.on( "restore", () => {
		throw new Error();
	});

	await windowInitializer( owner );

	const windowRecord = env.store.peekRecord( "window", 1 );
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

	assert.strictEqual( nwWindow.x, 2020, "nwWindow's x property has been updated" );
	assert.strictEqual( nwWindow.y, 100, "nwWindow's y property has been updated" );
	assert.strictEqual( nwWindow.width, 1440, "nwWindow's width property has been updated" );
	assert.strictEqual( nwWindow.height, 810, "nwWindow's height property has been updated" );

	// remove second screen (window is now out of bounds)
	const secondScreen = nwScreen.screens.pop();

	// require all three events to be triggered after triggering displayBoundsChanged
	let resolveMove, resolveResize;
	const promise = Promise.all([
		new Promise( r => resolveMove = r ),
		new Promise( r => resolveResize = r )
	]);
	nwWindow.once( "move", () => {
		assert.ok( true, "Calls nwWindow.moveTo()" );
		resolveMove();
	});
	nwWindow.once( "resize", () => {
		assert.ok( true, "Calls nwWindow.resizeTo()" );
		resolveResize();
	});

	nwScreen.emit( "displayBoundsChanged" );
	await promise;

	// wait for the debounce time of the events
	await new Promise( resolve => setTimeout( resolve, 2 ) );

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

	assert.strictEqual( nwWindow.x, 480, "nwWindow's x property has been reset" );
	assert.strictEqual( nwWindow.y, 270, "nwWindow's y property has been reset" );
	assert.strictEqual( nwWindow.width, 960, "nwWindow's width property has been reset" );
	assert.strictEqual( nwWindow.height, 540, "nwWindow's height property has been reset" );

	// move window between two screens
	nwScreen.screens.push( secondScreen );
	nwWindow.x = 1440;
	nwWindow.emit( "move", nwWindow.x, nwWindow.y );

	// wait for the debounce time of the move event
	await new Promise( resolve => setTimeout( resolve, 2 ) );

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

	assert.strictEqual( nwWindow.x, 1440, "nwWindow's x property has been set" );
	assert.strictEqual( nwWindow.y, 270, "nwWindow's y property has been set" );
	assert.strictEqual( nwWindow.width, 960, "nwWindow's width property has been set" );
	assert.strictEqual( nwWindow.height, 540, "nwWindow's height property has been set" );

});


test( "Existing window record with position off screen", async assert => {

	assert.expect( 9 );

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [{
				id: "1",
				x: -10000,
				y: -10000,
				width: 1920,
				height: 1080,
				maximized: true
			}];
		},
		async updateRecord() {
			assert.ok( true, "Calls adapter.updateRecord()" );
		}
	}) );

	const resetWindow = resetWindowInjector({
		"nwjs/App": { manifest },
		"nwjs/Window": nwWindow,
		"nwjs/Screen": nwScreen
	})[ "default" ];

	const { default: windowInitializer } = windowInitializerInjector({
		"config": {
			vars: {
				"time-window-event-debounce": 1,
				"time-window-event-ignore": 1
			}
		},
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": resetWindow,
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: false
		}
	});

	nwWindow.on( "maximize", () => {
		assert.ok( true, "Calls nwWindow.maximize()" );
	});

	nwWindow.on( "restore", () => {
		throw new Error();
	});

	await windowInitializer( owner );

	// wait for the debounce time of the events
	await new Promise( resolve => setTimeout( resolve, 2 ) );

	const windowRecord = env.store.peekRecord( "window", 1 );
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

	assert.strictEqual( nwWindow.x, 480, "nwWindow's x property has been updated" );
	assert.strictEqual( nwWindow.y, 270, "nwWindow's y property has been updated" );
	assert.strictEqual( nwWindow.width, 960, "nwWindow's width property has been updated" );
	assert.strictEqual( nwWindow.height, 540, "nwWindow's height property has been updated" );

});


test( "Debounce events", async assert => {

	assert.expect( 4 );

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [{
				id: "1",
				x: 480,
				y: 270,
				width: 960,
				height: 540,
				maximized: false
			}];
		},
		async updateRecord() {
			assert.ok( true, "Calls adapter.updateRecord()" );
		}
	}) );

	const { default: windowInitializer } = windowInitializerInjector({
		"config": {
			vars: {
				"time-window-event-debounce": 5,
				"time-window-event-ignore": 1
			}
		},
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": () => {
			throw new Error();
		},
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: false
		}
	});

	await windowInitializer( owner );

	const windowRecord = env.store.peekRecord( "window", 1 );

	for ( let i = 0; i < 3; i++ ) {
		nwWindow.emit( "move", 0, 0 );
		nwWindow.emit( "resize", 1920, 1080 );
		await new Promise( resolve => setTimeout( resolve, 1 ) );
	}

	await new Promise( resolve => setTimeout( resolve, 5 ) );

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


test( "Ignore events", async assert => {

	assert.expect( 7 );

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [{
				id: "1",
				x: 480,
				y: 270,
				width: 960,
				height: 540,
				maximized: true
			}];
		},
		async updateRecord() {
			assert.ok( true, "Calls adapter.updateRecord()" );
		}
	}) );

	const { default: windowInitializer } = windowInitializerInjector({
		"config": {
			vars: {
				"time-window-event-debounce": 1,
				"time-window-event-ignore": 5
			}
		},
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": () => {
			throw new Error();
		},
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: false
		}
	});

	await windowInitializer( owner );

	const windowRecord = env.store.peekRecord( "window", 1 );

	for ( let event of [ "minimize", "maximize" ] ) {
		// maximize triggers updateRecord() separately
		nwWindow.emit( event );
		// those events will be ignored
		nwWindow.emit( "move", 0, 0 );
		nwWindow.emit( "resize", 1920, 1080 );
		await new Promise( resolve => setTimeout( resolve, 5 ) );
		// these events won't be ignored
		nwWindow.emit( "move", 0, 0 );
		nwWindow.emit( "resize", 1920, 1080 );
		await new Promise( resolve => setTimeout( resolve, 2 ) );
	}

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


test( "Special window coordinates on Windows", async assert => {

	assert.expect( 3 );

	nwScreen.screens = [
		{
			bounds: {
				x: -64000,
				y: -64000,
				width: 128000,
				height: 128000
			}
		}
	];

	owner.register( "adapter:window", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls adapter.findAll()" );
			return [{
				id: "1",
				x: 480,
				y: 270,
				width: 960,
				height: 540,
				maximized: false
			}];
		}
	}) );

	const { default: windowInitializer } = windowInitializerInjector({
		"config": {
			vars: {
				"time-window-event-debounce": 1,
				"time-window-event-ignore": 1
			}
		},
		"nwjs/Window": nwWindow,
		"nwjs/Window/reset": () => {
			throw new Error();
		},
		"nwjs/Screen": nwScreen,
		"utils/node/platform": {
			isWin: true
		}
	});

	await windowInitializer( owner );

	const windowRecord = env.store.peekRecord( "window", 1 );

	nwWindow.x = -8;
	nwWindow.y = -8;
	nwWindow.emit( "move", nwWindow.x, nwWindow.y );

	await new Promise( resolve => setTimeout( resolve, 2 ) );

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

	nwWindow.x = -32000;
	nwWindow.y = -32000;
	nwWindow.emit( "move", nwWindow.x, nwWindow.y );

	await new Promise( resolve => setTimeout( resolve, 2 ) );

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
