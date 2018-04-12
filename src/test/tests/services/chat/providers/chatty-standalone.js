import { module, test } from "qunit";
import sinon from "sinon";
import { twitch as twitchConfig } from "config";

import chatProviderInjector
	from "inject-loader?-utils/parameters/Parameter!services/chat/providers/-provider";
import chatProviderBasicInjector
	// eslint-disable-next-line max-len
	from "inject-loader?-utils/parameters/ParameterCustom&-utils/parameters/Substitution!services/chat/providers/-basic";
import chatProviderChattyStandaloneInjector
	from "inject-loader?-./chatty!services/chat/providers/chatty-standalone";


module( "services/chat/providers/chatty-standalone", {
	beforeEach() {
		this.launch = sinon.stub();
		this.whichFallback = sinon.stub();

		const { default: ChatProvider } = chatProviderInjector({
			"config": {
				"twitch": twitchConfig
			},
			"../launch": this.launch
		});

		const { default: ChatProviderBasic } = chatProviderBasicInjector({
			"./-provider": ChatProvider,
			"utils/node/fs/whichFallback": this.whichFallback
		});

		const { default: ChatProviderChattyStandalone } = chatProviderChattyStandaloneInjector({
			"./-basic": ChatProviderBasic
		});

		this.subject = ChatProviderChattyStandalone;
	}
});


test( "Default attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallback.resolves( "C:\\Chatty\\Chatty.exe" );

	/** @type ChatProviderChattyStandalone */
	const provider = new this.subject();
	await provider.setup({
		exec: "Chatty.exe",
		fallback: []
	});
	await provider.launch({
		name: "baz"
	});

	assert.propEqual(
		this.whichFallback.getCall(0).args,
		[ "Chatty.exe", [] ],
		"Calls whichFallback with default attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"C:\\Chatty\\Chatty.exe",
			[
				"-connect",
				"-channel",
				"baz"
			]
		],
		"Calls launch with correct exec and default params"
	);

});


test( "User attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallback.resolves( "C:\\Chatty\\Chatty.exe" );

	/** @type ChatProviderJava */
	const provider = new this.subject();
	await provider.setup({
		exec: "Chatty.exe",
		fallback: [],
		attributes: [
			{ name: "exec" },
			{ name: "args" },
			{ name: "instance" },
			{ name: "auth" }
		]
	}, {
		exec: "C:\\Chatty\\Chatty.exe",
		args: "-cd",
		instance: true,
		auth: true
	});
	await provider.launch({
		name: "baz"
	}, {
		user_name: "user",
		access_token: "token",
		isLoggedIn: true
	});

	assert.propEqual(
		this.whichFallback.getCall(0).args,
		[ "C:\\Chatty\\Chatty.exe" ],
		"Calls whichFallback with user attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"C:\\Chatty\\Chatty.exe",
			[
				"-single",
				"-connect",
				"-channel",
				"baz",
				"-user",
				"user",
				"-token",
				"token",
				"-cd"
			]
		],
		"Calls launch with correct exec and params list"
	);

});


test( "User attributes and no session data", async function( assert ) {

	this.launch.resolves();
	this.whichFallback.resolves( "C:\\Chatty\\Chatty.exe" );

	/** @type ChatProviderJava */
	const provider = new this.subject();
	await provider.setup({
		exec: "Chatty.exe",
		fallback: [],
		attributes: [
			{ name: "exec" },
			{ name: "args" },
			{ name: "jar" },
			{ name: "instance" },
			{ name: "auth" }
		]
	}, {
		exec: "C:\\Chatty\\Chatty.exe",
		args: "-cd",
		instance: false,
		auth: true
	});
	await provider.launch({
		name: "baz"
	}, {
		isLoggedIn: false
	});

	assert.propEqual(
		this.whichFallback.getCall(0).args,
		[ "C:\\Chatty\\Chatty.exe" ],
		"Calls whichFallback with user attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"C:\\Chatty\\Chatty.exe",
			[
				"-connect",
				"-channel",
				"baz",
				"-cd"
			]
		],
		"Calls launch with correct exec and params list"
	);

});
