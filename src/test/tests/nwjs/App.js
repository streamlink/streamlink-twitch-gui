import { module, test } from "qunit";
import { EventEmitter } from "events";
import sinon from "sinon";

import appInjector from "inject-loader!nwjs/App";


module( "nwjs/App" );


test( "Exported properties", assert => {

	const App = Object.assign( new EventEmitter(), {
		argv: {},
		filteredArgv: {},
		manifest: {}
	});
	const removeAllListenersSpy = sinon.spy( App, "removeAllListeners" );

	const nwGui = {
		App
	};

	const {
		default: app,
		argv,
		filteredArgv,
		manifest,
		quit
	} = appInjector({
		"./nwGui": nwGui,
		"./process": {}
	});

	assert.propEqual( removeAllListenersSpy.args, [[ "open" ]], "Removes 'open' event listeners" );
	assert.strictEqual( app, App, "Exports the nwGui.App object as default" );
	assert.strictEqual( argv, nwGui.App.argv, "Exports the argv" );
	assert.strictEqual( filteredArgv, nwGui.App.filteredArgv, "Exports the filteredArgv" );
	assert.strictEqual( manifest, nwGui.App.manifest, "Exports the manifest" );
	assert.ok( quit instanceof Function, "Exports the quit function" );

});


test( "Quit", assert => {

	const quitSpy = sinon.spy();
	const listener = sinon.stub().throws( new Error() );
	const App = Object.assign( new EventEmitter(), {
		quit: quitSpy
	});
	const Process = new EventEmitter();

	const { quit } = appInjector({
		"./nwGui": {
			App
		},
		"./process": Process
	});

	Process.on( "exit", listener );
	quit();

	assert.ok( listener.calledOnce, "Emits the exit event" );
	assert.ok( quitSpy.calledAfter( listener ), "Calls quit afterwards" );

});
