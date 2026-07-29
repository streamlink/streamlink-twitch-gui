import { module, test } from "qunit";
import sinon from "sinon";

import { EventEmitter } from "events";

import onShutdownInjector from "inject-loader!utils/node/onShutdown";


module( "utils/node/onShutdown", function( hooks ) {
	const events = [ "exit", "SIGHUP", "SIGINT", "SIGTERM" ];

	class WindowEventTargetEmitter extends EventEmitter {
		addEventListener( event, listener ) {
			return this.addListener( event, listener );
		}
		removeEventListener( event, listener ) {
			return this.removeListener( event, listener );
		}
	}

	/** @typedef {Object} TestContextUtilsNodeOnShutdown */
	hooks.beforeEach( /** @this {TestContextUtilsNodeOnShutdown} */ function() {
		this.process = new EventEmitter();
		this.window = new WindowEventTargetEmitter();
		const { default: onShutdown } = onShutdownInjector({
			"nwjs/process": this.process,
			"nwjs/Window": {
				window: this.window
			}
		});
		this.onShutdown = onShutdown;
	});


	test( "Events - process", function( assert ) {
		/** @this {TestContextUtilsNodeOnShutdown} */
		for ( const event of events ) {
			const spy = sinon.spy();
			this.onShutdown( spy );
			assert.propEqual( this.process.eventNames(), events, "Registers all event listeners" );
			this.process.emit( event );
			assert.ok( spy.calledOnce, "Executes callback" );
			assert.propEqual( this.process.eventNames(), [], "Unregisters all event listeners" );
		}
	});

	test( "Events - nwWindow", function( assert ) {
		/** @this {TestContextUtilsNodeOnShutdown} */
		const spy = sinon.spy();
		this.onShutdown( spy );
		assert.propEqual( this.window.eventNames(), [ "beforeunload" ], "Listens to beforeunload" );
		this.window.emit( "beforeunload" );
		assert.ok( spy.calledOnce, "Executes callback" );
		assert.propEqual( this.window.eventNames(), [], "Unregisters all event listeners" );
	});

	test( "Unregister", function( assert ) {
		/** @this {TestContextUtilsNodeOnShutdown} */
		const spy = sinon.spy();
		const unregister = this.onShutdown( spy );
		assert.propEqual( this.process.eventNames(), events, "Registers all event listeners" );
		assert.propEqual( this.window.eventNames(), [ "beforeunload" ], "Listens to beforeunload" );
		assert.ok( unregister instanceof Function, "Returns unregister function" );
		unregister();
		assert.propEqual( this.process.eventNames(), [], "Unregisters all event listeners" );
		assert.propEqual( this.window.eventNames(), [], "Unregisters all event listeners" );
	});

	test( "Multiple listeners - process", function( assert ) {
		/** @this {TestContextUtilsNodeOnShutdown} */
		const spyA = sinon.spy();
		const spyB = sinon.spy();
		const spyC = sinon.spy();
		this.onShutdown( spyA );
		const unregister = this.onShutdown( spyB );
		this.onShutdown( spyC );
		for ( const event of events ) {
			assert.strictEqual( this.process.listenerCount( event ), 3, "Has 3 listeners" );
		}
		unregister();
		for ( const event of events ) {
			assert.strictEqual( this.process.listenerCount( event ), 2, "Has 2 listeners" );
		}
		this.process.emit( "exit" );
		assert.ok( spyA.calledOnce, "Executes spyA once" );
		assert.notOk( spyB.called, "Does not execute spyB" );
		assert.ok( spyC.calledOnce, "Executes spyC once" );
		assert.propEqual( this.process.eventNames(), [], "Unregisters all event listeners" );
	});

	test( "Multiple listeners - window", function( assert ) {
		/** @this {TestContextUtilsNodeOnShutdown} */
		const spyA = sinon.spy();
		const spyB = sinon.spy();
		const spyC = sinon.spy();
		this.onShutdown( spyA );
		const unregister = this.onShutdown( spyB );
		this.onShutdown( spyC );
		assert.strictEqual( this.window.listenerCount( "beforeunload" ), 3, "Has 3 listeners" );
		unregister();
		assert.strictEqual( this.window.listenerCount( "beforeunload" ), 2, "Has 2 listeners" );
		this.window.emit( "beforeunload" );
		assert.ok( spyA.calledOnce, "Executes spyA once" );
		assert.notOk( spyB.called, "Does not execute spyB" );
		assert.ok( spyC.calledOnce, "Executes spyC once" );
		assert.propEqual( this.window.eventNames(), [], "Unregisters all event listeners" );
	});
});
