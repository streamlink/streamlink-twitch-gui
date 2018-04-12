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


module( "services/chat/providers/-java", {
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

		this.subject = ChatProviderJava;
	}
});


test( "Default attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallbackJava.resolves( "/foo/java" );
	this.whichFallbackJar.resolves( "/bar/app.jar" );

	/** @type ChatProviderJava */
	const provider = new this.subject();
	await provider.setup({
		exec: "java",
		fallback: "/foo",
		jar: "app.jar",
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
		[ "app.jar", "/bar", this.isFile, true ],
		"Calls jar's whichFallback with default attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[ "/foo/java", [ "-jar", "/bar/app.jar" ] ],
		"Calls launch with correct exec and default params"
	);

});


test( "User attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallbackJava.resolves( "/bar/java" );
	this.whichFallbackJar.resolves( "/foo/app.jar" );

	/** @type ChatProviderJava */
	const provider = new this.subject();
	await provider.setup({
		exec: "java",
		fallback: "/foo",
		jar: "app.jar",
		jarfallback: "/bar",
		attributes: [
			{ name: "exec" },
			{ name: "args" },
			{ name: "jar" }
		]
	}, {
		exec: "/bar/java",
		args: "\"--url={url}\" --channel \"{channel}\" --user \"{user}\" --token \"{token}\"",
		jar: "/foo/app.jar"
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
		[ "/foo/app.jar", null, this.isFile ],
		"Calls jar's whichFallback with user attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"/bar/java",
			[
				"-jar",
				"/foo/app.jar",
				"--url=https://www.twitch.tv/popout/baz/chat",
				"--channel",
				"baz",
				"--user",
				"user",
				"--token",
				"token"
			]
		],
		"Calls launch with correct exec and params list"
	);

});
