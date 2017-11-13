import {
	module,
	test
} from "qunit";
import sinon from "sinon";
import chatProviderInjector from "inject-loader!services/ChatService/providers/-provider";
import chatProviderBrowserInjector from "inject-loader!services/ChatService/providers/browser";


module( "services/ChatService/providers/browser", {
	beforeEach( assert ) {
		this.openBrowser = sinon.stub();

		const { default: ChatProvider } = chatProviderInjector({
			"config": {
				"twitch": {
					"chat-url": "https://twitch.tv/{channel}/chat"
				}
			},
			"../launch": () => {
				assert.ok( false, "Should not get called" );
			},
			"utils/parameters/Parameter": class {
				static getParameters() {
					assert.ok( false, "Should not get called" );
				}
			}
		});

		const { default: ChatProviderBrowser } = chatProviderBrowserInjector({
			"./-provider": ChatProvider,
			"nwjs/Shell": {
				openBrowser: this.openBrowser
			}
		});

		this.subject = ChatProviderBrowser;
	}
});


test( "Opens chat in default browser", async function( assert ) {

	this.openBrowser.resolves();

	/** @type ChatProviderBrowser */
	const provider = new this.subject();
	await provider.setup();
	await provider.launch({ name: "bar" });

	assert.strictEqual(
		this.openBrowser.getCall(0).args[0],
		"https://twitch.tv/{channel}/chat",
		"Uses the configured Twitch chat URL"
	);
	assert.propEqual(
		this.openBrowser.getCall(0).args[1],
		{ channel: "bar" },
		"Sets the channel variable"
	);

});
