import { module, test } from "qunit";
import sinon from "sinon";
import { twitch as twitchConfig } from "config";

import chatProviderInjector
	from "inject-loader?-utils/parameters/Parameter!services/chat/providers/-provider";
import chatProviderBasicInjector
	from "inject-loader?-utils/parameters/ParameterCustom!services/chat/providers/-basic";
import Substitution from "utils/parameters/Substitution";


module( "services/chat/providers/-basic", {
	beforeEach() {
		this.whichFallback = sinon.stub();
		this.launch = sinon.stub();

		const { default: ChatProvider } = chatProviderInjector({
			"config": {
				"twitch": twitchConfig
			},
			"../launch": this.launch
		});

		const { default: ChatProviderBasic } = chatProviderBasicInjector({
			"./-provider": ChatProvider,
			"utils/node/fs/whichFallback": this.whichFallback,
			"utils/parameters/Substitution": Substitution
		});

		this.subject = ChatProviderBasic;
	}
});


test( "Substitutions list", function( assert ) {

	const { userArgsSubstitutions: list } = this.subject;

	assert.ok(
		Array.isArray( list ),
		"Has the static userArgsSubstitutions property"
	);
	assert.ok(
		list.every( substitution => substitution instanceof Substitution ),
		"Array only contains substitution objects"
	);

});


test( "Default attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallback.resolves( "/bar/foo" );

	/** @type ChatProviderBasic */
	const provider = new this.subject();
	await provider.setup({
		exec: "foo",
		fallback: "/bar"
	});
	await provider.launch({
		name: "baz"
	});

	assert.propEqual(
		this.whichFallback.getCall(0).args,
		[ "foo", "/bar" ],
		"Calls whichFallback with default attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[ "/bar/foo", [] ],
		"Calls launch with correct exec and empty params"
	);

});


test( "User attributes", async function( assert ) {

	this.launch.resolves();
	this.whichFallback.resolves( "/bar/bar" );

	/** @type ChatProviderBasic */
	const provider = new this.subject();
	await provider.setup({
		exec: "foo",
		fallback: "/bar",
		attributes: [ { name: "exec" }, { name: "args" }, { name: "url" } ]
	}, {
		exec: "bar",
		args: "\"--url={url}\" --channel \"{channel}\" --user \"{user}\" --token \"{token}\"",
		url: "embed"
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
		[ "bar" ],
		"Calls whichFallback with user attributes"
	);
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"/bar/bar",
			[
				"--url=https://www.twitch.tv/embed/baz/chat",
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


test( "User attributes and no session data", async function( assert ) {

	this.launch.resolves();
	this.whichFallback.resolves( "foo" );

	/** @type ChatProviderBasic */
	const provider = new this.subject();
	await provider.setup({
		exec: "foo",
		fallback: "/bar",
		attributes: [ { name: "exec" }, { name: "args" }, { name: "url" } ]
	}, {
		exec: "foo",
		args: "\"--url={url}\" --channel \"{channel}\" --user \"{user}\" --token \"{token}\"",
		url: "popout"
	});
	await provider.launch({ name: "baz" });

	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"foo",
			[
				"--url=https://www.twitch.tv/popout/baz/chat",
				"--channel",
				"baz",
				"--user",
				"{user}",
				"--token",
				"{token}"
			]
		],
		"Calls launch with correct exec and params list"
	);

});
