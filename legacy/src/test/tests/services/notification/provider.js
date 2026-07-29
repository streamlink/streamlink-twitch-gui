import { module, test } from "qunit";

import providerInjector from "inject-loader!services/notification/provider";


module( "services/notification/provider" );


test( "isSupported", assert => {

	const { isSupported } = providerInjector({
		"./logger": {},
		"./providers": {
			"foo": {
				isSupported() { return true; }
			},
			"bar": {
				isSupported() { return false; }
			}
		}
	});

	assert.strictEqual( isSupported( "foo" ), true, "Foo is supported" );
	assert.strictEqual( isSupported( "bar" ), false, "Bar is not supported" );
	assert.strictEqual( isSupported( "qux" ), false, "Unkown provider" );

});


test( "showNotification - invalid / unsupported", async assert => {

	const providers = {
		auto: class {
			static isSupported() {
				return false;
			}
		},
		foo: class {
			static isSupported() {
				return false;
			}
		},
		bar: class {
			static isSupported() {
				return false;
			}
		}
	};

	const { showNotification } = providerInjector({
		"./logger": {},
		"./providers": providers
	});

	try {
		await showNotification( "unknown", {} );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Invalid notification provider",
			"Rejects if provider is unknown"
		);
	}

	try {
		await showNotification( "foo", {} );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"The notification provider is not supported",
			"Rejects if provider is unsupported"
		);
	}

	try {
		await showNotification( "auto", {} );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Couldn't find a notification provider",
			"Rejects if all providers are unsupported"
		);
	}

});


test( "showNotification - instance cache and setup", async assert => {

	assert.expect( 51 );

	let rejectFooSetup;
	let failNotify = true;
	let expectedData;

	const providers = {
		auto: class {
			static isSupported() {
				assert.step( "auto.isSupported" );
				return false;
			}
			async setup() {
				// should never get called
				assert.step( "auto.setup" );
			}
			async notify() {
				// should never get called
				assert.step( "auto.notify" );
			}
		},
		foo: class {
			static isSupported() {
				assert.step( "foo.isSupported" );
				return true;
			}
			async setup() {
				assert.step( "foo.setup" );
				await new Promise( r => rejectFooSetup = r );
				throw new Error( "setup fail" );
			}
			async notify() {
				assert.step( "foo.notify" );
			}
		},
		bar: class {
			static isSupported() {
				assert.step( "bar.isSupported" );
				return true;
			}
			async setup() {
				assert.step( "bar.setup" );
			}
			async notify( data ) {
				assert.step( "bar.notify" );
				if ( failNotify ) {
					throw new Error( "notify fail" );
				}
				assert.strictEqual( data, expectedData, "Uses the correct notification data" );
			}
		}
	};

	const { showNotification } = providerInjector({
		"./logger": {
			logDebug() {
				assert.step( "logDebug" );
			}
		},
		"./providers": providers
	});

	try {
		const promise = showNotification( "foo", {} );
		rejectFooSetup();
		await promise;
	} catch ( e ) {
		assert.checkSteps( [ "foo.isSupported", "foo.setup" ], "Sets up foo" );
		assert.strictEqual( e.message, "setup fail", "Rejects if non-fallback provider fails" );
	}

	try {
		const promise = showNotification( "foo", {} );
		rejectFooSetup();
		await promise;
	} catch ( e ) {
		assert.checkSteps( [ "foo.isSupported", "foo.setup" ], "Tries to set up foo again" );
		assert.strictEqual( e.message, "setup fail", "Rejects if non-fallback provider fails" );
	}

	try {
		const promise = showNotification( "foo", {} );
		showNotification( "foo", {} ).catch( () => {} );
		rejectFooSetup();
		await promise;
	} catch ( e ) {
		assert.checkSteps(
			[ "foo.isSupported", "foo.setup", "foo.isSupported" ],
			"Doesn't set up foo again if setup is still running"
		);
		assert.strictEqual( e.message, "setup fail", "Rejects if non-fallback provider fails" );
	}

	try {
		await showNotification( "bar", {} );
	} catch ( e ) {
		assert.checkSteps(
			[ "bar.isSupported", "bar.setup", "logDebug", "bar.notify" ],
			"Sets up bar and notifies"
		);
		assert.strictEqual( e.message, "notify fail", "Rejects if non-fallback provider fails" );
	}

	try {
		await showNotification( "bar", {} );
	} catch ( e ) {
		assert.checkSteps(
			[ "bar.isSupported", "logDebug", "bar.notify" ],
			"bar is already set up"
		);
		assert.strictEqual( e.message, "notify fail", "Rejects if non-fallback provider fails" );
	}

	try {
		const promise = showNotification( "auto", {} );
		rejectFooSetup();
		await promise;
	} catch ( e ) {
		assert.checkSteps(
			[
				"auto.isSupported",
				"foo.isSupported",
				"foo.setup",
				"bar.isSupported",
				"logDebug",
				"bar.notify"
			],
			"Tries to set up foo again when selecting auto"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find a notification provider",
			"Rejects if all fallback providers fail"
		);
	}

	try {
		await showNotification( "bar", {}, true );
	} catch ( e ) {
		assert.checkSteps(
			[ "bar.isSupported", "bar.setup", "logDebug", "bar.notify" ],
			"Sets up bar again"
		);
		assert.strictEqual( e.message, "notify fail", "Rejects if non-fallback provider fails" );
	}

	failNotify = false;
	providers.baz = class {
		static isSupported() {
			// should never get called
			assert.step( "baz.isSupported" );
		}
	};

	expectedData = {};
	await showNotification( "bar", expectedData );
	assert.checkSteps( [ "bar.isSupported", "logDebug", "bar.notify" ], "Resolves with bar" );
	const promise = showNotification( "auto", expectedData );
	rejectFooSetup();
	await promise;
	assert.checkSteps(
		[
			"auto.isSupported",
			"foo.isSupported",
			"foo.setup",
			"bar.isSupported",
			"logDebug",
			"bar.notify"
		],
		"Resolves with bar on auto"
	);

});
