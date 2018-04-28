import { module, test } from "qunit";
import sinon from "sinon";
import { twitch as twitchConfig } from "config";

import chatProviderInjector
	from "inject-loader?-utils/parameters/Parameter!services/chat/providers/-provider";
import chatProviderBasicInjector
	// eslint-disable-next-line max-len
	from "inject-loader?-utils/parameters/ParameterCustom&-utils/parameters/Substitution!services/chat/providers/-basic";
import chatProviderJavaInjector
	from "inject-loader?-utils/parameters/Parameter!services/chat/providers/-java";
import chatProviderChattyInjector
	from "inject-loader?-utils/parameters/Parameter!services/chat/providers/chatty";


module( "services/chat/providers/chatty", {
	beforeEach() {
		this.launch = sinon.stub();
		this.whichFallbackJava = sinon.stub();
		this.whichFallbackJar = sinon.stub();
		this.isFile = () => {};

		const { default: ChatProvider } = chatProviderInjector({
			"config": {
				"twitch": twitchConfig
			},
			"../launch": this.launch
		});

		const { default: ChatProviderBasic } = chatProviderBasicInjector({
			"./-provider": ChatProvider,
			"utils/node/fs/whichFallback": this.whichFallbackJava
		});

		const { default: ChatProviderJava } = chatProviderJavaInjector({
			"./-basic": ChatProviderBasic,
			"utils/node/fs/stat": {
				isFile: this.isFile
			},
			"utils/node/fs/whichFallback": this.whichFallbackJar
		});

		const { default: ChatProviderChatty } = chatProviderChattyInjector({
			"./-java": ChatProviderJava
		});

		this.subject = ChatProviderChatty;
	}
});


test( "Default attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallbackJava.resolves( "/foo/java" );
	this.whichFallbackJar.resolves( "/bar/chatty.jar" );

	/** @type ChatProviderChatty */
	const provider = new this.subject();
	await provider.setup({
		exec: "java",
		fallback: "/foo",
		jar: "chatty.jar",
		jarfallback: "/bar"
	});
	await provider.launch({
		name: "baz"
	});

	assert.propEqual(
		this.whichFallbackJava.getCall(0).args,
		[ "java", "/foo" ],
		"Calls java's whichFallback with default attributes"
	);
	assert.propEqual(
		this.whichFallbackJar.getCall(0).args,
		[ "chatty.jar", "/bar", this.isFile, true ],
		"Calls jar's whichFallback with default attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"/foo/java",
			[
				"-jar",
				"/bar/chatty.jar",
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
	this.whichFallbackJava.resolves( "/bar/java" );
	this.whichFallbackJar.resolves( "/foo/chatty.jar" );

	/** @type ChatProviderJava */
	const provider = new this.subject();
	await provider.setup({
		exec: "java",
		fallback: "/foo",
		jar: "chatty.jar",
		jarfallback: "/bar",
		attributes: [
			{ name: "exec" },
			{ name: "args" },
			{ name: "jar" },
			{ name: "instance" },
			{ name: "auth" }
		]
	}, {
		exec: "/bar/java",
		args: "-cd",
		jar: "/foo/chatty.jar",
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
		this.whichFallbackJava.getCall(0).args,
		[ "/bar/java" ],
		"Calls java's whichFallback with user attributes"
	);
	assert.propEqual(
		this.whichFallbackJar.getCall(0).args,
		[ "/foo/chatty.jar", null, this.isFile ],
		"Calls jar's whichFallback with user attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"/bar/java",
			[
				"-jar",
				"/foo/chatty.jar",
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
	this.whichFallbackJava.resolves( "/bar/java" );
	this.whichFallbackJar.resolves( "/foo/chatty.jar" );

	/** @type ChatProviderJava */
	const provider = new this.subject();
	await provider.setup({
		exec: "java",
		fallback: "/foo",
		jar: "chatty.jar",
		jarfallback: "/bar",
		attributes: [
			{ name: "exec" },
			{ name: "args" },
			{ name: "jar" },
			{ name: "instance" },
			{ name: "auth" }
		]
	}, {
		exec: "/bar/java",
		args: "-cd",
		jar: "/foo/chatty.jar",
		instance: false,
		auth: true
	});
	await provider.launch({
		name: "baz"
	}, {
		isLoggedIn: false
	});

	assert.propEqual(
		this.whichFallbackJava.getCall(0).args,
		[ "/bar/java" ],
		"Calls java's whichFallback with user attributes"
	);
	assert.propEqual(
		this.whichFallbackJar.getCall(0).args,
		[ "/foo/chatty.jar", null, this.isFile ],
		"Calls jar's whichFallback with user attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"/bar/java",
			[
				"-jar",
				"/foo/chatty.jar",
				"-connect",
				"-channel",
				"baz",
				"-cd"
			]
		],
		"Calls launch with correct exec and params list"
	);

});
