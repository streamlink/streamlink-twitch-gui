import { module, test } from "qunit";
import sinon from "sinon";
import { EventEmitter } from "events";

import notificationProviderGrowlInjector
	from "inject-loader!services/notification/providers/growl";
import NotificationData from "services/notification/data";


module( "services/notification/providers/growl", {
	beforeEach() {
		this.connection = null;

		class Connection extends EventEmitter {}
		this.setTimeoutSpy = sinon.spy();
		this.endSpy = sinon.spy();
		this.connectStub = sinon.stub().callsFake( () => {
			this.connection = new Connection();
			return this.connection;
		});
		Connection.prototype.setTimeout = this.setTimeoutSpy;
		Connection.prototype.end = this.endSpy;

		this.registerStub = sinon.stub();
		this.setHostSpy = sinon.spy();
		this.notifyStub = sinon.stub();

		const { default: NotificationProviderGrowl } = notificationProviderGrowlInjector({
			config: {
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
			},
			net: {
				connect: this.connectStub
			},
			growly: {
				register: this.registerStub,
				setHost: this.setHostSpy,
				notify: this.notifyStub
			}
		});

		this.subject = NotificationProviderGrowl;
	}
});


test( "isSupported", function( assert ) {

	assert.ok( this.subject.isSupported(), "Is supported on all platforms" );

});


test( "checkConnection", async function( assert ) {

	const error = new Error( "fail" );

	await assert.rejects( async () => {
		const promise = this.subject.checkConnection( 1234 );
		this.connection.emit( "error", error );
		await promise;
	}, error, "Rejects on connection error" );
	assert.ok( this.connectStub.calledWith( 1234, "localhost" ), "Connects to the correct server" );
	assert.ok( this.setTimeoutSpy.calledWith( 100 ), "Sets the connection timeout" );
	assert.ok( this.endSpy.calledOnce, "Always calls connection.end" );

	this.connectStub.resetHistory();
	this.setTimeoutSpy.resetHistory();
	this.endSpy.resetHistory();

	const promise = this.subject.checkConnection( 1234 );
	this.connection.emit( "connect" );
	await promise;
	assert.ok( this.connectStub.calledWith( 1234, "localhost" ), "Connects to the correct server" );
	assert.ok( this.setTimeoutSpy.calledWith( 100 ), "Sets the connection timeout" );
	assert.ok( this.endSpy.calledOnce, "Always calls connection.end" );

});


test( "register", async function( assert ) {

	const error = new Error( "fail" );

	this.registerStub.callsFake( ( appname, icon, options, callback ) => {
		callback( error );
	});

	await assert.rejects(
		this.subject.register(),
		error,
		"Rejects on connection error"
	);
	assert.ok(
		this.registerStub.calledWith( "application name", "", [{ label: "application name" }] ),
		"Registers app"
	);

	this.registerStub.reset();
	this.registerStub.callsFake( ( appname, icon, options, callback ) => {
		callback( null );
	});

	await this.subject.register();
	assert.ok(
		this.registerStub.calledWith( "application name", "", [{ label: "application name" }] ),
		"Registers app"
	);

});


test( "setup", async function( assert ) {

	const checkConnectionStub = this.subject.checkConnection = sinon.stub();
	const registerStub = this.subject.register = sinon.stub();

	checkConnectionStub.rejects();
	registerStub.resolves();

	await assert.rejects(
		new this.subject().setup(),
		new Error( "Could not find growl server" ),
		"Rejects if all checkConnection calls fail"
	);
	assert.propEqual( checkConnectionStub.args, [ [ 1234 ], [ 5678 ] ], "Checks all server ports" );
	assert.notOk( this.setHostSpy.called, "Doesn't set host" );
	assert.notOk( registerStub.called, "Doesn't call register" );

	this.setHostSpy.resetHistory();
	checkConnectionStub.reset();
	checkConnectionStub.onCall( 0 ).resolves();
	checkConnectionStub.onCall( 1 ).rejects();
	registerStub.reset();
	registerStub.rejects();

	await assert.rejects(
		new this.subject().setup(),
		new Error( "Could not find growl server" ),
		"Rejects if first register call and second checkConnection call fails"
	);
	assert.propEqual( checkConnectionStub.args, [ [ 1234 ], [ 5678 ] ], "Checks all server ports" );
	assert.ok( this.setHostSpy.calledWith( "localhost", 1234 ), "Sets host" );
	assert.ok( registerStub.calledOnce, "Calls register once" );
	assert.ok( registerStub.calledAfter( this.setHostSpy ), "Registers after setting host" );

	this.setHostSpy.resetHistory();
	checkConnectionStub.reset();
	checkConnectionStub.resolves();
	registerStub.reset();
	registerStub.rejects();

	await assert.rejects(
		new this.subject().setup(),
		new Error( "Could not find growl server" ),
		"Rejects if all register calls fail"
	);
	assert.propEqual( checkConnectionStub.args, [ [ 1234 ], [ 5678 ] ], "Checks all server ports" );
	assert.propEqual(
		this.setHostSpy.args,
		[ [ "localhost", 1234 ], [ "localhost", 5678 ] ],
		"Sets host twice"
	);
	assert.ok( registerStub.calledTwice, "Calls register once" );
	assert.ok(
		   registerStub.getCall( 0 ).calledAfter( this.setHostSpy.getCall( 0 ) )
		&& registerStub.getCall( 1 ).calledAfter( this.setHostSpy.getCall( 1 ) ),
		"Registers after setting host"
	);

	this.setHostSpy.resetHistory();
	checkConnectionStub.reset();
	checkConnectionStub.resolves();
	registerStub.reset();
	registerStub.resolves();

	await new this.subject().setup();
	assert.propEqual( checkConnectionStub.args, [ [ 1234 ] ], "Only checks first server port" );
	assert.ok( this.setHostSpy.calledWith( "localhost", 1234 ), "Sets host" );
	assert.ok( registerStub.calledOnce, "Calls register once" );
	assert.ok( registerStub.calledAfter( this.setHostSpy ), "Registers after setting host" );

	this.setHostSpy.resetHistory();
	checkConnectionStub.reset();
	checkConnectionStub.onCall( 0 ).rejects();
	checkConnectionStub.onCall( 1 ).resolves();
	registerStub.reset();
	registerStub.resolves();

	await new this.subject().setup();
	assert.propEqual( checkConnectionStub.args, [ [ 1234 ], [ 5678 ] ], "Checks all server ports" );
	assert.ok( this.setHostSpy.calledWith( "localhost", 5678 ), "Sets host" );
	assert.ok( registerStub.calledOnce, "Calls register once" );
	assert.ok( registerStub.calledAfter( this.setHostSpy ), "Registers after setting host" );

});


test( "notify", async function( assert ) {

	const error = new Error( "fail" );

	const clickSpy = sinon.spy();

	const inst = new this.subject();
	const data = new NotificationData({
		title: "foo",
		message: "bar",
		icon: "icon-path",
		click: clickSpy
	});

	this.notifyStub.callsFake( ( message, data, callback ) => callback( error ) );

	await assert.rejects(
		inst.notify( data ),
		error,
		"Rejects on notification failure"
	);
	assert.propEqual( this.notifyStub.calledWith(
		"bar",
		{ label: "application name", title: "foo", icon: "icon-path" },
		"Calls growly.notify with correct parameters"
	) );

	this.notifyStub.reset();
	this.notifyStub.callsFake( ( message, data, callback ) => callback( null, undefined ) );
	data.message = [
		{ title: "bar" },
		{ title: "baz" }
	];

	await inst.notify( data );
	assert.propEqual( this.notifyStub.calledWith(
		"bar, baz",
		{ label: "application name", title: "foo", icon: "icon-path" },
		"Calls growly.notify with correct parameters"
	) );
	assert.notOk( clickSpy.calledOnce, "Doesn't execute click callback" );

	this.notifyStub.reset();
	this.notifyStub.callsFake( ( message, data, callback ) => callback( null, "clicked" ) );

	await inst.notify( data );
	assert.propEqual( this.notifyStub.calledWith(
		"bar, baz",
		{ label: "application name", title: "foo", icon: "icon-path" },
		"Calls growly.notify with correct parameters"
	) );
	assert.ok( clickSpy.calledOnce, "Executes click callback" );

	clickSpy.resetHistory();
	this.notifyStub.reset();
	this.notifyStub.callsFake( ( message, data, callback ) => callback( null, "click" ) );

	await inst.notify( data );
	assert.propEqual( this.notifyStub.calledWith(
		"bar, baz",
		{ label: "application name", title: "foo", icon: "icon-path" },
		"Calls growly.notify with correct parameters"
	) );
	assert.ok( clickSpy.calledOnce, "Executes click callback" );

});
