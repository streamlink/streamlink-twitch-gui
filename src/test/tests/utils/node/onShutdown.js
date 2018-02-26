import { module, test } from "qunit";
import { EventEmitter } from "events";

import onShutdownInjector from "inject-loader!utils/node/onShutdown";


const events = [ "exit", "SIGTERM", "SIGHUP" ];
let Process, onShutdown;


module( "utils/node/onShutdown", {
	beforeEach() {
		Process = new EventEmitter();
		onShutdown = onShutdownInjector({
			"nwjs/process": Process
		})[ "default" ];
	},
	afterEach() {
		Process = onShutdown = null;
	}
});


test( "Events", assert => {

	assert.expect( 9 );

	events.forEach( event => {
		onShutdown( () => {
			assert.ok( true, "Calls callback" );
		});

		assert.propEqual( Process.eventNames(), events, "Registers all event listeners" );
		Process.emit( event );
		assert.propEqual( Process.eventNames(), [], "Unregisters all event listeners" );
	});

});


test( "Unregister", assert => {

	assert.expect( 3 );

	const unregister = onShutdown( () => {
		assert.ok( true, "Calls callback" );
	});
	assert.propEqual( Process.eventNames(), events, "Registers all event listeners" );
	assert.ok( unregister instanceof Function, "Returns unregister function" );
	unregister();
	assert.propEqual( Process.eventNames(), [], "Unregisters all event listeners" );

});


test( "Multiple listeners", assert => {

	assert.expect( 9 );

	onShutdown( () => {
		assert.ok( true, "Calls callback one" );
	});
	const unregister = onShutdown( () => {
		throw new Error();
	});
	onShutdown( () => {
		assert.ok( true, "Calls callback three" );
	});
	events.forEach( event => {
		assert.strictEqual( Process.listenerCount( event ), 3, "Has 3 listeners registered" );
	});
	unregister();
	events.forEach( event => {
		assert.strictEqual( Process.listenerCount( event ), 2, "Has 2 listeners registered" );
	});
	Process.emit( "exit" );
	assert.propEqual( Process.eventNames(), [], "Unregisters all event listeners" );

});
