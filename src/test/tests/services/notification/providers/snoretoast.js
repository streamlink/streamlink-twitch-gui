import { module, test } from "qunit";

import notificationProviderSnoreToastInjector
	from "inject-loader!services/notification/providers/snoretoast";
import NotificationData from "services/notification/data";


const config = {
	main: {
		"display-name": "application name"
	},
	notification: {
		provider: {
			snoretoast: {
				timeoutSetup: 2,
				timeoutNotify: 2
			}
		}
	}
};


module( "services/notification/providers/snoretoast" );


test( "isSupported", assert => {

	let NotificationProviderSnoreToast;

	NotificationProviderSnoreToast = notificationProviderSnoreToastInjector({
		config,
		"snoretoast-binaries": {},
		"nwjs/process": {},
		"utils/node/child_process/promise": {},
		"utils/node/resolvePath": {},
		"utils/node/fs/which": {},
		"utils/node/platform": {
			isWinGte8: true
		}
	})[ "default" ];

	assert.ok( NotificationProviderSnoreToast.isSupported(), "Supported on Windows 8+" );

	NotificationProviderSnoreToast = notificationProviderSnoreToastInjector({
		config,
		"snoretoast-binaries": {},
		"nwjs/process": {},
		"utils/node/child_process/promise": {},
		"utils/node/resolvePath": {},
		"utils/node/fs/which": {},
		"utils/node/platform": {
			isWinGte8: false
		}
	})[ "default" ];

	assert.notOk( NotificationProviderSnoreToast.isSupported(), "Not supported on other OSes" );

});


test( "setup", async assert => {

	assert.expect( 23 );

	let failWhich = true;
	let failProcess = true;
	let exitCode = 1;

	let expectedPath;

	const common = {
		config,
		"nwjs/process": {
			execPath: "C:\\foo"
		},
		"snoretoast-binaries": {
			x86: [ "bin", "win32", "snoretoast.exe" ],
			x64: [ "bin", "win64", "snoretoast.exe" ]
		},
		"utils/node/resolvePath": ( ...paths ) => {
			assert.propEqual( paths, expectedPath, "Resolves snoretoast.exe path" );
			return [ "C:\\bar", ...paths.slice( 1 ) ].join( "\\" );
		},
		"utils/node/fs/which": async path => {
			if ( failWhich ) {
				throw new Error( "fail which" );
			}
			assert.strictEqual( path, "C:\\bar\\bin\\win64\\snoretoast.exe", "Verifies path" );
			return path;
		},
		"utils/node/child_process/promise": async ( args, onExit, onStdOut, onStdErr, timeout ) => {
			if ( failProcess ) {
				throw new Error( "fail process" );
			}
			assert.propEqual( args, [
				"C:\\bar\\bin\\win64\\snoretoast.exe",
				[
					"-install",
					"application name.lnk",
					"C:\\foo",
					"application name"
				]
			], "Executes snoretoast with the correct parameters" );
			assert.ok( onExit instanceof Function, "Has an onExit callback" );
			assert.notOk( onStdOut, "Doesn't have an onStdOut callback" );
			assert.notOk( onStdErr, "Doesn't have an onStdErr callback" );
			assert.strictEqual( timeout, 2, "Sets child process execution timeout" );
			await new Promise( ( resolve, reject ) => onExit( exitCode, resolve, reject ) );
		}
	};

	let NotificationProviderSnoreToast;

	NotificationProviderSnoreToast = notificationProviderSnoreToastInjector( Object.assign({
		"utils/node/platform": {
			is64bit: false
		}
	}, common ) )[ "default" ];

	expectedPath = [ "%NWJSAPPPATH%", "bin", "win32", "snoretoast.exe" ];

	try {
		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail which", "Can't verify binary" );
	}

	NotificationProviderSnoreToast = notificationProviderSnoreToastInjector( Object.assign({
		"utils/node/platform": {
			is64bit: true
		}
	}, common ) )[ "default" ];

	expectedPath = [ "%NWJSAPPPATH%", "bin", "win64", "snoretoast.exe" ];

	try {
		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail which", "Can't verify binary" );
	}

	failWhich = false;

	try {
		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail process", "Can't execute binary" );
	}

	failProcess = false;

	try {
		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "Could not install application shortcut", "Shortcut fail" );
	}

	exitCode = 0;

	try {
		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
		assert.strictEqual( inst.exec, "C:\\bar\\bin\\win64\\snoretoast.exe", "Has exec path" );
	} catch ( e ) {
		throw e;
	}

});


test( "notify", async assert => {

	assert.expect( 31 );

	let failProcess = true;
	let exitCode = -1;
	let waitForStdOut = false;
	let stdout;

	let expectedMessage;

	const promiseChildprocess = async ( args, onExit, onStdOut, onStdErr, timeout ) => {
		if ( failProcess ) {
			throw new Error( "fail process" );
		}

		assert.propEqual( args, [
			"C:\\bar\\bin\\win64\\snoretoast.exe",
			[
				"-appID",
				"application name",
				"-silent",
				"-w",
				"-t",
				"title",
				"-m",
				expectedMessage,
				"-p",
				"icon-path"
			],
			{
				stdio: [ 1 ]
			}
		], "Executes snoretoast with the correct parameters" );
		assert.ok( onExit instanceof Function, "Has an onExit callback" );
		assert.ok( onStdOut instanceof Function, "Has an onStdOut callback" );
		assert.notOk( onStdErr, "Doesn't have an onStdErr callback" );
		assert.strictEqual( timeout, 2, "Sets child process execution timeout" );

		if ( waitForStdOut ) {
			await new Promise( resolve => {
				stdout = line => {
					onStdOut( line );
					resolve();
				};
			});
		}

		await new Promise( ( resolve, reject ) => onExit( exitCode, resolve, reject ) );
	};

	const { default: NotificationProviderSnoreToast } = notificationProviderSnoreToastInjector({
		config,
		"nwjs/process": {},
		"utils/node/platform": {},
		"snoretoast-binaries": {},
		"utils/node/resolvePath": {},
		"utils/node/fs/which": {},
		"utils/node/child_process/promise": promiseChildprocess
	});

	const inst = new NotificationProviderSnoreToast();
	inst.exec = "C:\\bar\\bin\\win64\\snoretoast.exe";

	const data = new NotificationData({
		title: "title",
		message: "message",
		icon: "icon-path",
		click() {
			assert.ok( true, "Executes click callback" );
		}
	});

	expectedMessage = "message";

	try {
		await inst.notify( data );
	} catch ( e ) {
		assert.strictEqual( e.message, "fail process", "Fails child process promise" );
	}

	failProcess = false;

	data.message = [
		{ title: "foo" },
		{ title: "bar" }
	];
	expectedMessage = "foo, bar";

	try {
		await inst.notify( data );
	} catch ( e ) {
		assert.ok( true, "Rejects on exit code -1 (failure)" );
	}

	exitCode = 1;

	try {
		await inst.notify( data );
	} catch ( e ) {
		assert.ok( true, "Rejects on exit code 1 (hidden)" );
	}

	exitCode = 2;

	await inst.notify( data );
	assert.ok( true, "Resolves on exit code 2 (dismissed)" );

	exitCode = 3;

	await inst.notify( data );
	assert.ok( true, "Resolves on exit code 3 (timeout)" );

	exitCode = 0;
	waitForStdOut = true;

	const promise = inst.notify( data );
	stdout( "The user clicked on the toast." );
	await promise;

});
