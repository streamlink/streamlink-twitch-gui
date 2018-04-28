import { module, test } from "qunit";
import { EventEmitter } from "events";

import notificationProviderGrowlInjector
	from "inject-loader!services/notification/providers/growl";
import NotificationData from "services/notification/data";


const config = {
	main: {
		"display-name": "application name"
	},
	notification: {
		provider: {
			growl: {
				host: "localhost",
				ports: [
					1234,
					5678
				],
				timeout: 100
			}
		}
	}
};


module( "services/notification/providers/growl" );


test( "isSupported", assert => {

	const { default: NotificationProviderGrowl } = notificationProviderGrowlInjector({
		config,
		net: {},
		growly: {}
	});

	assert.ok( NotificationProviderGrowl.isSupported(), "Is supported on all platforms" );

});


test( "checkConnection", async assert => {

	assert.expect( 9 );

	let connection;

	class Connection extends EventEmitter {
		constructor() {
			super();
		}
		setTimeout( time ) {
			assert.strictEqual( time, 100, "Sets the connection timeout" );
		}
		end() {
			assert.ok( true, "Ends the connection" );
		}
	}

	const { default: NotificationProviderGrowl } = notificationProviderGrowlInjector({
		config,
		growly: {},
		net: {
			connect( port, host ) {
				assert.strictEqual( port, 1234, "Connects to the correct port" );
				assert.strictEqual( host, "localhost", "Connects to the correct host" );
				connection = new Connection();
				return connection;
			}
		}
	});

	try {
		const promise = NotificationProviderGrowl.checkConnection( 1234 );
		connection.emit( "error", new Error( "fail" ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "fail", "Rejects on connection error" );
	}

	try {
		const promise = NotificationProviderGrowl.checkConnection( 1234 );
		connection.emit( "connect" );
		await promise;
	} catch ( e ) {
		throw e;
	}

});


test( "register", async assert => {

	assert.expect( 7 );

	let fail = true;

	const { default: NotificationProviderGrowl } = notificationProviderGrowlInjector({
		config,
		net: {},
		growly: {
			register( appname, icon, options, callback ) {
				assert.strictEqual( appname, "application name", "Registers app name" );
				assert.strictEqual( icon, "", "Doesn't set a permanent app icon" );
				assert.propEqual(
					options,
					[{ label: "application name" }],
					"Registers notification type with correct label"
				);
				if ( fail ) {
					callback( new Error( "fail" ) );
				} else {
					callback( null );
				}
			}
		}
	});

	try {
		await NotificationProviderGrowl.register();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail", "Rejects on connection error" );
	}

	fail = false;

	try {
		await NotificationProviderGrowl.register();
	} catch ( e ) {
		throw e;
	}

});


test( "setup", async assert => {

	let failCheckConnection;
	let failRegister;

	const { default: NotificationProviderGrowl } = notificationProviderGrowlInjector({
		config,
		net: {},
		growly: {
			setHost( host, port ) {
				assert.step( "setHost" );
				assert.step( host );
				assert.step( port );
			}
		}
	});

	NotificationProviderGrowl.checkConnection = async port => {
		assert.step( "checkConnection" );
		assert.step( port );
		if ( failCheckConnection.shift() ) {
			throw new Error( "fail check connection" );
		}
	};

	NotificationProviderGrowl.register = async () => {
		assert.step( "register" );
		if ( failRegister.shift() ) {
			throw new Error( "fail register" );
		}
	};


	try {
		failCheckConnection = [ true, true ];
		failRegister = [];
		await new NotificationProviderGrowl().setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "Could not find growl server" );
		assert.checkSteps(
			[
				"checkConnection", 1234,
				"checkConnection", 5678
			],
			"Rejects if all checkConnection calls fail"
		);
	}

	try {
		failCheckConnection = [ false, true ];
		failRegister = [ true ];
		await new NotificationProviderGrowl().setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "Could not find growl server" );
		assert.checkSteps(
			[
				"checkConnection", 1234, "setHost", "localhost", 1234, "register",
				"checkConnection", 5678
			],
			"Rejects if first register call and second checkConnection call fails"
		);
	}

	try {
		failCheckConnection = [ false, false ];
		failRegister = [ true, true ];
		await new NotificationProviderGrowl().setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "Could not find growl server" );
		assert.checkSteps(
			[
				"checkConnection", 1234, "setHost", "localhost", 1234, "register",
				"checkConnection", 5678, "setHost", "localhost", 5678, "register"
			],
			"Rejects if second register call fails"
		);
	}

	try {
		failCheckConnection = [ false ];
		failRegister = [ false ];
		await new NotificationProviderGrowl().setup();
		assert.checkSteps(
			[
				"checkConnection", 1234, "setHost", "localhost", 1234, "register"
			],
			"Resolves if first checkConnection and register calls succeed"
		);
	} catch ( e ) {
		throw e;
	}

	try {
		failCheckConnection = [ true, false ];
		failRegister = [ false ];
		await new NotificationProviderGrowl().setup();
		assert.checkSteps(
			[
				"checkConnection", 1234,
				"checkConnection", 5678, "setHost", "localhost", 5678, "register"
			],
			"Resolves if second checkConnection and register calls succeed"
		);
	} catch ( e ) {
		throw e;
	}

});


test( "notify", async assert => {

	assert.expect( 15 );

	let fail = true;
	let expectedMsg = "bar";
	let action;

	const { default: NotificationProviderGrowl } = notificationProviderGrowlInjector({
		config,
		net: {},
		growly: {
			notify( message, { label, title, icon }, callback ) {
				if ( fail ) {
					return callback( new Error( "fail" ) );
				}

				assert.strictEqual( label, "application name", "Uses correct label" );
				assert.strictEqual( title, "foo", "Sets the notification title" );
				assert.strictEqual( icon, "icon-path", "Uses correct icon path" );
				assert.strictEqual( message, expectedMsg, "Sets the correct notification message" );

				callback( null, action );
			}
		}
	});

	const inst = new NotificationProviderGrowl();
	const data = new NotificationData({
		title: "foo",
		message: "bar",
		icon: "icon-path",
		click() {
			assert.ok( true, "Executes click callback" );
		}
	});

	try {
		await inst.notify( data );
	} catch ( e ) {
		assert.strictEqual( e.message, "fail", "Rejects on notification failure" );
	}

	fail = false;
	expectedMsg = "bar, baz";
	data.message = [
		{ title: "bar" },
		{ title: "baz" }
	];
	await inst.notify( data );

	action = "clicked";
	await inst.notify( data );

	action = "click";
	await inst.notify( data );

});
