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
		"./providers": {}
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

	const { default: ChatService } = chatServiceInjector({
		"config": {
			"chat": {}
		},
		"./providers": {
			"qux": {}
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

	settingsService.chat.provider = "qux";
	await assert.rejects(
		chatService._getChatProvider(),
		new Error( "Missing chat provider settings: qux" )
	);

});


test( "Awaits provider setup", async function( assert ) {

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
	assert.strictEqual( chatProviderFooSetup.callCount, 1, "Calls foo.setup" );
	assert.propEqual( chatProviderFooSetup.getCall(0).args, [
		{
			exec: "foo",
			attributes: [{ name: "foo" }]
		},
		{
			foo: true
		}
	], "Called foo.setup with correct arguments" );
	assert.strictEqual( providerInstanceMap.size, 1, "Instance map has one entry" );
	assert.strictEqual( providerSetupMap.size, 1, "Setup map has one entry" );

	const promiseTwo = chatService._getChatProvider();
	assert.strictEqual( chatProviderFooSetup.callCount, 1, "Does not call foo.setup twice" );
	assert.strictEqual( providerInstanceMap.size, 1, "Instance map has one entry" );
	assert.strictEqual( providerSetupMap.size, 1, "Setup map has one entry" );

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

	// for for _getChatProvider promise to fulfill
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

	resolveFooLaunch();
	await promiseOne;

	// reject if provider.launch fails
	chatProviderFooLaunch.rejects( new Error( "Launch failed" ) );
	await assert.rejects( chatService.openChat( twitchChannel ), new Error( "Launch failed" ) );

});
