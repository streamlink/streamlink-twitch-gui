import { module, test } from "qunit";
import sinon from "sinon";

import { Buffer } from "buffer";
import { EventEmitter } from "events";
import { win32 as win32Path } from "path";

import notificationProviderSnoreToastInjector
	from "inject-loader?-events!services/notification/providers/snoretoast";
import NotificationData from "services/notification/data";


module( "services/notification/providers/snoretoast", function( hooks ) {
	/** @typedef {Object} TestContextServicesNotificationProviderSnoretoast */
	hooks.beforeEach( /** @this {TestContextServicesNotificationProviderSnoretoast} */ function() {
		const context = this;

		this.resolveStub = sinon.stub().callsFake( ( ...p ) => win32Path.join( "C:\\app", ...p ) );
		this.whichStub = sinon.stub().callsFake( async path => path );
		this.promiseChildProcessStub = sinon.stub();
		this.onShutdownSpy = sinon.spy();

		this.server = new EventEmitter();
		this.server.listen = sinon.stub().callsArg( 1 );
		this.server.close = sinon.spy();
		this.createServerStub = sinon.stub().returns( this.server );

		this.is64bit = true;
		this.isWinGte8 = true;

		this.subject = () => notificationProviderSnoreToastInjector({
			config: {
				main: {
					"display-name": "application name",
					"app-identifier": "application-name"
				},
				notification: {
					provider: {
						snoretoast: {
							timeoutSetup: 2,
							timeoutNotify: 2
						}
					}
				}
			},
			"net": {
				createServer: this.createServerStub
			},
			"path": {
				resolve: this.resolveStub
			},
			"nwjs/process": {
				execPath: "C:\\app\\executable"
			},
			"snoretoast-binaries": {
				x86: [ "bin", "win32", "snoretoast.exe" ],
				x64: [ "bin", "win64", "snoretoast.exe" ]
			},
			"utils/node/fs/which": this.whichStub,
			"utils/node/child_process/promise": this.promiseChildProcessStub,
			"utils/node/onShutdown": this.onShutdownSpy,
			"utils/node/platform": {
				get is64bit() {
					return context.is64bit;
				},
				get isWinGte8() {
					return context.isWinGte8;
				}
			}
		});
	});


	test( "isSupported", function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		assert.ok( NotificationProviderSnoreToast.isSupported(), "Supported on Windows 8+" );

		this.isWinGte8 = false;
		assert.notOk( NotificationProviderSnoreToast.isSupported(), "Not supported on other OSes" );
	});

	test( "Invalid executable path", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		const inst = new NotificationProviderSnoreToast();

		const error = new Error( "fail" );
		this.is64bit = false;
		this.whichStub.rejects( error );

		await assert.rejects( inst.setup(), error, "Fails to verify executable path" );
		assert.ok( this.resolveStub.calledOnce, "Resolves path first" );
		assert.ok(
			this.whichStub.calledOnceWithExactly( "C:\\app\\bin\\win32\\snoretoast.exe" ),
			"Calls which once with resolved win32 path"
		);
		assert.notOk( this.promiseChildProcessStub.called, "Doesn't execute invalid path" );

		this.resolveStub.resetHistory();
		this.whichStub.resetHistory();
		this.is64bit = true;

		await assert.rejects( inst.setup(), error, "Fails to verify executable path" );
		assert.ok( this.resolveStub.calledOnce, "Resolves path first" );
		assert.ok(
			this.whichStub.calledOnceWithExactly( "C:\\app\\bin\\win64\\snoretoast.exe" ),
			"Calls which once with resolved win64 path"
		);
		assert.notOk( this.promiseChildProcessStub.called, "Doesn't execute invalid path" );
	});

	test( "Snoretoast setup - failure", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		this.promiseChildProcessStub.rejects( new Error( "fail" ) );

		const inst = new NotificationProviderSnoreToast();
		await assert.rejects( inst.setup(), new Error( "fail" ), "Fails to execute" );
		assert.ok( this.promiseChildProcessStub.calledOnce, "Tries to execute once" );
		assert.propEqual(
			this.promiseChildProcessStub.getCall( 0 ).args,
			[
				[
					"C:\\app\\bin\\win64\\snoretoast.exe",
					[
						"-install",
						"application name",
						"C:\\app\\executable",
						"application name"
					]
				],
				new Function(),
				null,
				null,
				2
			],
			"Tries to execute snoretoast with correct setup parameters"
		);
	});

	test( "Snoretoast setup - exit code 1", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			await new Promise( ( resolve, reject ) => onExit( 1, resolve, reject ) );
		});

		const inst = new NotificationProviderSnoreToast();
		await assert.rejects(
			inst.setup(),
			new Error( "Could not install application shortcut" ),
			"Fails to setup"
		);
	});

	test( "Snoretoast setup - server error", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			await new Promise( ( resolve, reject ) => onExit( 0, resolve, reject ) );
		});
		this.server.listen.reset();
		this.server.listen.callsFake( () => this.server.emit( "error", new Error( "fail" ) ) );

		const inst = new NotificationProviderSnoreToast();
		await assert.rejects( inst.setup(), new Error( "fail" ), "Fails to start server" );
		assert.ok( this.server.close.calledOnce, "Closes server on error" );
		assert.notOk( this.onShutdownSpy.called, "Doesn't set up onShutdown callback on error" );

		await inst.cleanup();
		assert.ok( this.server.close.calledOnce, "Doesn't close server twice on cleanup" );
	});

	test( "Snoretoast setup - success", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			await new Promise( ( resolve, reject ) => onExit( 0, resolve, reject ) );
		});

		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
		assert.propEqual(
			this.server.listen.getCall( 0 ).args,
			[ "\\\\.\\pipe\\application-name", new Function() ],
			"Calls server.listen() with correct pipe name"
		);
		assert.notOk( this.server.close.called, "Does not close server" );
		assert.ok( this.onShutdownSpy.calledOnce, "Sets up onShutdown callback" );

		this.onShutdownSpy.getCall( 0 ).args[ 0 ]();
		assert.ok( this.server.close.calledOnce, "Closes server on shutdown" );
	});

	test( "Named pipe messages", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			await new Promise( ( resolve, reject ) => onExit( 0, resolve, reject ) );
		});

		const onMessageSpy = sinon.spy();
		const conn = new EventEmitter();
		const inst = new NotificationProviderSnoreToast();
		inst.messages.on( "message", onMessageSpy );
		await inst.setup();
		this.server.emit( "connection", conn );

		let message = "foo=bar;baz=qux=quux;asdf=;;";
		conn.emit( "data", Buffer.from( message, "utf16le" ) );
		assert.propEqual(
			onMessageSpy.getCall( 0 ).args,
			[{
				"foo": "bar",
				"baz": "qux=quux",
				"asdf": ""
			}],
			"Parses message"
		);
	});

	test( "Messages", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		this.promiseChildProcessStub.returns( Promise.resolve() );

		const inst = new NotificationProviderSnoreToast();
		await inst.setup();
		this.promiseChildProcessStub.resetHistory();

		await inst.notify( new NotificationData({
			title: "foo",
			message: "bar",
			icon: "icon-path",
			click: new Function()
		}) );
		await inst.notify( new NotificationData({
			title: "baz",
			message: " ",
			icon: "icon-path",
			click: new Function()
		}) );
		assert.propEqual(
			this.promiseChildProcessStub.args.map( args => args[0] ),
			[
				[
					"C:\\app\\bin\\win64\\snoretoast.exe",
					[
						"-appID",
						"application name",
						"-silent",
						"-t",
						"foo",
						"-m",
						"bar",
						"-p",
						"icon-path",
						"-id",
						"1",
						"-pipeName",
						"\\\\.\\pipe\\application-name",
						"-application",
						"C:\\app\\executable"
					],
					{
						"stdio": [ 1 ]
					}
				],
				[
					"C:\\app\\bin\\win64\\snoretoast.exe",
					[
						"-appID",
						"application name",
						"-silent",
						"-t",
						"baz",
						"-m",
						" ",
						"-p",
						"icon-path",
						"-id",
						"2",
						"-pipeName",
						"\\\\.\\pipe\\application-name",
						"-application",
						"C:\\app\\executable"
					],
					{
						"stdio": [ 1 ]
					}
				]
			],
			"Ensures non-empty messages"
		);
	});

	test( "Notify fail and message format", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const { default: NotificationProviderSnoreToast } = this.subject();
		const inst = new NotificationProviderSnoreToast();
		inst.exec = "C:\\app\\bin\\win64\\snoretoast.exe";
		const error = new Error( "fail" );

		const dataOne = new NotificationData({
			title: "title",
			message: "message",
			icon: "icon-path",
			click: new Function()
		});

		this.promiseChildProcessStub.rejects( error );

		await assert.rejects( inst.notify( dataOne ), error, "Fails to execute" );
		assert.ok( this.promiseChildProcessStub.calledOnce, "Tries to execute once" );
		assert.propEqual(
			this.promiseChildProcessStub.getCall( 0 ).args,
			[
				[
					"C:\\app\\bin\\win64\\snoretoast.exe",
					[
						"-appID",
						"application name",
						"-silent",
						"-t",
						"title",
						"-m",
						"message",
						"-p",
						"icon-path",
						"-id",
						"1",
						"-pipeName",
						"\\\\.\\pipe\\application-name",
						"-application",
						"C:\\app\\executable"
					],
					{
						stdio: [ 1 ]
					}
				],
				new Function(),
				null,
				null,
				2
			],
			"Tries to execute snoretoast with correct parameters"
		);

		this.promiseChildProcessStub.resetHistory();
		const dataTwo = new NotificationData({
			title: "title",
			message: [
				{ title: "foo" },
				{ title: "bar" }
			],
			icon: "icon-path",
			click: new Function()
		});

		await assert.rejects( inst.notify( dataTwo ), error, "Fails to execute" );
		assert.ok( this.promiseChildProcessStub.calledOnce, "Tries to execute once" );
		assert.propEqual(
			this.promiseChildProcessStub.getCall( 0 ).args,
			[
				[
					"C:\\app\\bin\\win64\\snoretoast.exe",
					[
						"-appID",
						"application name",
						"-silent",
						"-t",
						"title",
						"-m",
						"foo, bar",
						"-p",
						"icon-path",
						"-id",
						"2",
						"-pipeName",
						"\\\\.\\pipe\\application-name",
						"-application",
						"C:\\app\\executable"
					],
					{
						stdio: [ 1 ]
					}
				],
				new Function(),
				null,
				null,
				2
			],
			"Tries to execute snoretoast with correct parameters"
		);
	});

	test( "Snoretoast return codes and click callback", async function( assert ) {
		/** @this {TestContextServicesNotificationProviderSnoretoast} */
		const {
			default: NotificationProviderSnoreToast,
			EXIT_CODE_FAILED,
			EXIT_CODE_SUCCESS,
			EXIT_CODE_HIDDEN,
			EXIT_CODE_DISMISSED,
			EXIT_CODE_TIMEOUT
		} = this.subject();
		const inst = new NotificationProviderSnoreToast();
		inst.exec = "C:\\app\\bin\\win64\\snoretoast.exe";

		const onClickSpy = sinon.spy();
		const data = new NotificationData({
			title: "title",
			message: "message",
			icon: "icon-path",
			click: onClickSpy
		});

		let code;
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			await new Promise( ( resolve, reject ) => onExit( code, resolve, reject ) );
		});

		code = "unknown";
		await assert.rejects( inst.notify( data ), undefined, "Rejects on unknown code" );
		assert.notOk( onClickSpy.called, "Doesn't call onClick" );

		code = EXIT_CODE_FAILED;
		await assert.rejects( inst.notify( data ), undefined, "Rejects on EXIT_CODE_FAILED" );
		assert.notOk( onClickSpy.called, "Doesn't call onClick" );

		code = EXIT_CODE_HIDDEN;
		await assert.rejects( inst.notify( data ), undefined, "Rejects on EXIT_CODE_HIDDEN" );
		assert.notOk( onClickSpy.called, "Doesn't call onClick" );

		code = EXIT_CODE_DISMISSED;
		await inst.notify( data );
		assert.notOk( onClickSpy.called, "Doesn't call onClick on EXIT_CODE_DISMISSED" );

		code = EXIT_CODE_TIMEOUT;
		await inst.notify( data );
		assert.notOk( onClickSpy.called, "Doesn't call onClick on EXIT_CODE_TIMEOUT" );

		code = EXIT_CODE_SUCCESS;
		await inst.notify( data );
		assert.notOk( onClickSpy.called, "Doesn't call onClick without clicked event" );

		code = EXIT_CODE_SUCCESS;
		let promise;
		let message;

		this.promiseChildProcessStub.reset();
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			inst.messages.emit( "message", message );
			await new Promise( ( resolve, reject ) => onExit( code, resolve, reject ) );
		});

		message = { action: "invalid" };
		await inst.notify( data );
		assert.notOk( onClickSpy.called, "Doesn't call onClick with invalid event message" );

		message = {
			action: "clicked",
			notificationId: "8",
			pipe: "\\\\.\\pipe\\application-name",
			application: "C:\\app\\executable"
		};
		assert.strictEqual( inst.messages.listenerCount( "message" ), 0, "Has no listeners" );
		promise = inst.notify( data );
		assert.strictEqual( inst.messages.listenerCount( "message" ), 1, "Has message listener" );
		await promise;
		assert.ok( onClickSpy.calledOnce, "Calls onClick on EXIT_CODE_SUCCESS" );
		assert.strictEqual( inst.messages.listenerCount( "message" ), 0, "Has no listeners" );
	});
});
