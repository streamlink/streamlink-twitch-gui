import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import Evented from "@ember/object/evented";
import Service from "@ember/service";
import sinon from "sinon";

import chatServiceInjector from "inject-loader?config&./providers!services/chat/service";


function _buildFakeModel( data ) {
	Object.defineProperty( data, "toJSON", {
		enumerable: false,
		value() {
			return Object.assign( {}, this );
		}
	});
	return data;
}


module( "services/chat", {
	beforeEach() {
		const AuthService = Service.extend({
			session: {
				access_token: "token",
				user_name: "user",
				isLoggedIn: true
			}
		});
		const SettingsService = Service.extend( Evented, {
			chat: {
				provider: "foo",
				providers: _buildFakeModel({
					foo: {
						foo: true
					}
				})
			}
		});

		this.owner = buildOwner();
		this.owner.register( "service:auth", AuthService );
		this.owner.register( "service:settings", SettingsService );
	},

	afterEach() {
		runDestroy( this.owner );
	}
});


test( "Resets provider instance and setup maps on settings update", function( assert ) {

	const {
		default: ChatService,
		providerInstanceMap,
		providerSetupMap
	} = chatServiceInjector({
		"config": {
			"chat": {}
		},
		"./providers": {},
		"./logger": {}
	});

	this.owner.register( "service:chat", ChatService );

	const settingsService = this.owner.lookup( "service:settings" );

	// initialize ChatService
	this.owner.lookup( "service:chat" );

	assert.ok( providerInstanceMap instanceof Map, "Exports an instance map" );
	assert.ok( providerSetupMap instanceof Map, "Exports a setup map" );
	assert.strictEqual( providerInstanceMap.size, 0, "Instance map is empty initially" );
	assert.strictEqual( providerSetupMap.size, 0, "Setup map is empty initially" );

	// add data
	providerInstanceMap.set( "foo", {} );
	providerSetupMap.set( "foo", Promise.resolve() );

	settingsService.trigger( "didUpdate" );

	assert.strictEqual( providerInstanceMap.size, 0, "Resets instance map" );
	assert.strictEqual( providerSetupMap.size, 0, "Resets setup map" );

});


test( "Rejects missing provider data", async function( assert ) {

	const logDebugStub = sinon.stub().resolves();
	const logErrorStub = sinon.stub().resolves();

	const { default: ChatService } = chatServiceInjector({
		"config": {
			"chat": {}
		},
		"./providers": {
			"qux": {}
		},
		"./logger": {
			logDebug: logDebugStub,
			logError: logErrorStub
		}
	});

	this.owner.register( "service:chat", ChatService );

	const chatService = this.owner.lookup( "service:chat" );
	const settingsService = this.owner.lookup( "service:settings" );

	settingsService.chat.provider = "unknown";
	await assert.rejects(
		chatService._getChatProvider(),
		new Error( "Invalid provider: unknown" )
	);
	assert.notOk( logDebugStub.called, "Doesn't call logDebug" );
	assert.notOk( logErrorStub.called, "Doesn't call logError" );

	settingsService.chat.provider = "qux";
	await assert.rejects(
		chatService._getChatProvider(),
		new Error( "Missing chat provider settings: qux" )
	);
	assert.notOk( logDebugStub.called, "Doesn't call logDebug" );
	assert.notOk( logErrorStub.called, "Doesn't call logError" );

});


test( "Awaits provider setup", async function( assert ) {

	const logDebugStub = sinon.stub().resolves();
	const logErrorStub = sinon.stub().resolves();

	class ChatProviderFoo {
		async setup() {}
		async launch() {}
	}
	const chatProviderFooSetup = sinon.stub( ChatProviderFoo.prototype, "setup" );

	const {
		default: ChatService,
		providerInstanceMap,
		providerSetupMap
	} = chatServiceInjector({
		config: {
			chat: {
				foo: {
					exec: "foo",
					attributes: [
						{ name: "foo" }
					]
				}
			}
		},
		"./providers": {
			foo: ChatProviderFoo
		},
		"./logger": {
			logDebug: logDebugStub,
			logError: logErrorStub
		}
	});

	this.owner.register( "service:chat", ChatService );
	const chatService = this.owner.lookup( "service:chat" );

	assert.strictEqual( providerInstanceMap.size, 0, "Instance map is empty" );
	assert.strictEqual( providerSetupMap.size, 0, "Setup map is empty" );
	assert.strictEqual( chatProviderFooSetup.callCount, 0, "foo.setup call count is zero" );

	let resolveFooSetup;
	chatProviderFooSetup.resolves( new Promise( resolve => resolveFooSetup = resolve ) );

	const promiseOne = chatService._getChatProvider();

	// wait for logDebug promise to fulfill
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.strictEqual( chatProviderFooSetup.callCount, 1, "Calls foo.setup" );
	assert.propEqual( chatProviderFooSetup.args, [[
		{
			exec: "foo",
			attributes: [{ name: "foo" }]
		},
		{
			foo: true
		}
	]], "Called foo.setup with correct arguments" );
	assert.strictEqual( providerInstanceMap.size, 1, "Instance map has one entry" );
	assert.strictEqual( providerSetupMap.size, 1, "Setup map has one entry" );
	assert.ok( logDebugStub.calledWith( "Resolving chat provider" ), "Calls logDebug" );
	assert.notOk( logErrorStub.called, "Doesn't call logError" );

	const promiseTwo = chatService._getChatProvider();
	assert.strictEqual( chatProviderFooSetup.callCount, 1, "Does not call foo.setup twice" );
	assert.strictEqual( providerInstanceMap.size, 1, "Instance map has one entry" );
	assert.strictEqual( providerSetupMap.size, 1, "Setup map has one entry" );
	assert.ok( logDebugStub.calledOnce, "Only calls logDebug once" );
	assert.notOk( logErrorStub.called, "Doesn't call logError" );

	resolveFooSetup();

	const resultOne = await promiseOne;
	assert.ok( resultOne instanceof ChatProviderFoo, "Returns chat provider foo instance" );
	const resultTwo = await promiseTwo;
	assert.ok( resultTwo instanceof ChatProviderFoo, "Returns chat provider foo instance" );

	// reject if setup fails
	providerInstanceMap.clear();
	providerSetupMap.clear();
	chatProviderFooSetup.rejects( new Error( "Setup failed" ) );
	await assert.rejects( chatService._getChatProvider(), new Error( "Setup failed" ) );

});


test( "Opens chat", async function( assert ) {

	const logDebugStub = sinon.stub().resolves();
	const logErrorStub = sinon.stub().resolves();

	class ChatProviderFoo {
		async setup() {}
		async launch() {}
	}
	const chatProviderFooLaunch = sinon.stub( ChatProviderFoo.prototype, "launch" );

	const { default: ChatService } = chatServiceInjector({
		config: {
			chat: {
				foo: {}
			}
		},
		"./providers": {
			foo: ChatProviderFoo
		},
		"./logger": {
			logDebug: logDebugStub,
			logError: logErrorStub
		}
	});

	this.owner.register( "service:chat", ChatService );
	const chatService = this.owner.lookup( "service:chat" );

	const twitchChannel = _buildFakeModel({
		name: "bar"
	});

	let resolveFooLaunch;
	chatProviderFooLaunch.resolves( new Promise( resolve => resolveFooLaunch = resolve ) );

	const promiseOne = chatService.openChat( twitchChannel );

	assert.propEqual( logDebugStub.args, [[
		"Preparing to launch chat",
		{
			channel: "bar",
			user: "user"
		}
	]], "Logs preparing to launch chat" );

	// wait for _getChatProvider promise to fulfill
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.strictEqual( chatProviderFooLaunch.callCount, 1, "Calls foo.launch" );
	assert.propEqual( chatProviderFooLaunch.getCall(0).args, [
		{
			name: "bar"
		},
		{
			access_token: "token",
			user_name: "user",
			isLoggedIn: true
		}
	], "Calls foo.launch with correct parameters" );
	assert.propEqual( logDebugStub.args.slice( 1 ), [[
		"Resolving chat provider",
		{
			provider: "foo",
			providerUserData: {
				foo: true
			}
		}
	]], "Log resolving chat provider" );
	assert.notOk( logErrorStub.called, "Doesn't call logError" );

	resolveFooLaunch();
	await promiseOne;

	logDebugStub.resetHistory();
	logErrorStub.resetHistory();

	// reject if provider.launch fails
	const error = new Error( "Launch failed" );
	chatProviderFooLaunch.rejects( error );
	await assert.rejects( chatService.openChat( twitchChannel ), error );
	assert.ok( logDebugStub.calledWith( "Preparing to launch chat" ), "Logs preparing to launch" );
	assert.ok( logErrorStub.calledWithExactly( error ), "Calls logError with error" );

});
