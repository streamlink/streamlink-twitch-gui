import { module, test } from "qunit";
import sinon from "sinon";

import { win32 as win32Path } from "path";

import notificationProviderSnoreToastInjector
	from "inject-loader!services/notification/providers/snoretoast";
import NotificationData from "services/notification/data";


module( "services/notification/providers/snoretoast", function( hooks ) {
	hooks.beforeEach(function() {
		const context = this;

		this.resolveStub = sinon.stub().callsFake( ( ...p ) => win32Path.join( "C:\\app", ...p ) );
		this.whichStub = sinon.stub().callsFake( async path => path );
		this.promiseChildProcessStub = sinon.stub();
		this.is64bit = true;
		this.isWinGte8 = true;

		this.subject = () => notificationProviderSnoreToastInjector({
			config: {
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
		const { default: NotificationProviderSnoreToast } = this.subject();
		assert.ok( NotificationProviderSnoreToast.isSupported(), "Supported on Windows 8+" );

		this.isWinGte8 = false;
		assert.notOk( NotificationProviderSnoreToast.isSupported(), "Not supported on other OSes" );
	});

	test( "Invalid executable path", async function( assert ) {
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

	test( "Snoretoast setup", async function( assert ) {
		const { default: NotificationProviderSnoreToast } = this.subject();
		const inst = new NotificationProviderSnoreToast();

		this.promiseChildProcessStub.rejects( new Error( "fail" ) );

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

		let code = 1;
		this.promiseChildProcessStub.reset();
		this.promiseChildProcessStub.callsFake( async ( params, onExit ) => {
			await new Promise( ( resolve, reject ) => onExit( code, resolve, reject ) );
		});

		await assert.rejects(
			inst.setup(),
			new Error( "Could not install application shortcut" ),
			"Fails to setup"
		);

		code = 0;
		await inst.setup();
	});

	test( "Notify fail and message format", async function( assert ) {
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
						"icon-path"
					],
					{
						stdio: [ 1 ]
					}
				],
				new Function(),
				new Function(),
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
						"icon-path"
					],
					{
						stdio: [ 1 ]
					}
				],
				new Function(),
				new Function(),
				null,
				2
			],
			"Tries to execute snoretoast with correct parameters"
		);
	});

	test( "Snoretoast return codes and click callback", async function( assert ) {
		const {
			default: NotificationProviderSnoreToast,
			EXIT_CODE_FAILED,
			EXIT_CODE_SUCCESS,
			EXIT_CODE_HIDDEN,
			EXIT_CODE_DISMISSED,
			EXIT_CODE_TIMEOUT,
			MSG_CLICK
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

		let code, stdOut;
		this.promiseChildProcessStub.callsFake( async ( params, onExit, onStdOut ) => {
			if ( stdOut ) {
				onStdOut( stdOut );
			}
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

		code = EXIT_CODE_SUCCESS;
		await inst.notify( data );
		assert.notOk( onClickSpy.calledOnce, "Doesn't call onClick on missing stdOut" );

		stdOut = "invalid";

		code = EXIT_CODE_SUCCESS;
		await inst.notify( data );
		assert.notOk( onClickSpy.calledOnce, "Doesn't call onClick on invalid stdOut" );

		stdOut = MSG_CLICK;

		code = EXIT_CODE_DISMISSED;
		await inst.notify( data );
		assert.notOk( onClickSpy.called, "Doesn't call onClick on EXIT_CODE_DISMISSED" );

		code = EXIT_CODE_TIMEOUT;
		await inst.notify( data );
		assert.notOk( onClickSpy.called, "Doesn't call onClick on EXIT_CODE_TIMEOUT" );

		code = EXIT_CODE_SUCCESS;
		await inst.notify( data );
		assert.ok( onClickSpy.calledOnce, "Calls onClick on EXIT_CODE_SUCCESS" );
	});
});
