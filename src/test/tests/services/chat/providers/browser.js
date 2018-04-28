import { module, test } from "qunit";
import sinon from "sinon";
import { twitch as twitchConfig } from "config";

import chatProviderInjector from "inject-loader!services/chat/providers/-provider";
import chatProviderBrowserInjector from "inject-loader!services/chat/providers/browser";


module( "services/chat/providers/browser", {
	beforeEach() {
		this.openExternalSpy = sinon.stub();
		this.launchSpy = sinon.spy();
		this.getParametersSpy = sinon.spy();

		const { default: ChatProvider } = chatProviderInjector({
			"config": {
				"twitch": twitchConfig
			},
			"../launch": this.launchSpy,
			"utils/parameters/Parameter": {
				getParameters: this.getParametersSpy
			}
		});

		const { default: ChatProviderBrowser } = chatProviderBrowserInjector({
			"./-provider": ChatProvider,
			"nwjs/nwGui": {
				Shell: {
					openExternal: this.openExternalSpy
				}
			}
		});

		this.subject = ChatProviderBrowser;
	}
});


test( "Default attributes", async function( assert ) {

	/** @type ChatProviderBrowser */
	const provider = new this.subject();
	await provider.setup({});
	await provider.launch({ name: "foo" });

	assert.propEqual(
		this.openExternalSpy.args,
		[[ "https://www.twitch.tv/popout/foo/chat" ]],
		"Uses the configured default Twitch chat URL"
	);
	assert.notOk( this.getParametersSpy.called, "Doesn't call getParameters" );
	assert.notOk( this.launchSpy.called, "Doesn't call launch" );

});


test( "User attributes: non-existent", async function( assert ) {

	/** @type ChatProviderBrowser */
	const provider = new this.subject();
	await provider.setup({
		attributes: [{ name: "url" }]
	}, {
		url: "non-existent"
	});
	await provider.launch({ name: "foo" });

	assert.propEqual(
		this.openExternalSpy.args,
		[[ "https://www.twitch.tv/popout/foo/chat" ]],
		"Uses the configured Twitch chat URL for profile default"
	);

});


test( "User attributes: default", async function( assert ) {

	/** @type ChatProviderBrowser */
	const provider = new this.subject();
	await provider.setup({
		attributes: [{ name: "url" }]
	}, {
		url: "default"
	});
	await provider.launch({ name: "foo" });

	assert.propEqual(
		this.openExternalSpy.args,
		[[ "https://www.twitch.tv/popout/foo/chat" ]],
		"Uses the configured Twitch chat URL for profile default"
	);

});


test( "User attributes: popout", async function( assert ) {

	/** @type ChatProviderBrowser */
	const provider = new this.subject();
	await provider.setup({
		attributes: [{ name: "url" }]
	}, {
		url: "popout"
	});
	await provider.launch({ name: "foo" });

	assert.propEqual(
		this.openExternalSpy.args,
		[[ "https://www.twitch.tv/popout/foo/chat" ]],
		"Uses the configured Twitch chat URL for profile popout"
	);

});


test( "User attributes: embed", async function( assert ) {

	/** @type ChatProviderBrowser */
	const provider = new this.subject();
	await provider.setup({
		attributes: [{ name: "url" }]
	}, {
		url: "embed"
	});
	await provider.launch({ name: "foo" });

	assert.propEqual(
		this.openExternalSpy.args,
		[[ "https://www.twitch.tv/embed/foo/chat" ]],
		"Uses the configured Twitch chat URL for profile embed"
	);

});
