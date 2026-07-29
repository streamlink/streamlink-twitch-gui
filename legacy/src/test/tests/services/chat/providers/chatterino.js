import { module, test } from "qunit";
import sinon from "sinon";

import chatProviderInjector
	from "inject-loader?../launch!services/chat/providers/-provider";
import chatProviderBasicInjector
	from "inject-loader?./-provider!services/chat/providers/-basic";
import chatProviderChatterinoInjector
	from "inject-loader?./-provider!services/chat/providers/chatterino";


module( "services/chat/providers/chatterino", function( hooks ) {
	/** @typedef {Object} TestContextChatProviderChatterino */
	hooks.beforeEach( /** @this {TestContextChatProviderChatterino} */ function() {
		this.launch = sinon.stub();

		const { default: ChatProvider } = chatProviderInjector({
			"../launch": this.launch
		});

		const { default: ChatProviderBasic } = chatProviderBasicInjector({
			"./-provider": ChatProvider
		});

		const { default: ChatProviderChatterino } = chatProviderChatterinoInjector({
			"./-basic": ChatProviderBasic
		});

		this.subject = ChatProviderChatterino;
	});


	test( "Default attributes", async function( assert ) {
		/** @this {TestContextChatProviderChatterino} */
		const provider = new this.subject();
		sinon.stub( provider, "_getExec" ).resolves( "/path/to/chatterino" );

		await provider.setup( {}, {} );
		await provider.launch( "foo", {} );

		assert.propEqual(
			this.launch.args,
			[[
				"/path/to/chatterino",
				[ "--channels", "t:foo" ]
			]],
			"Spawns child process and uses the correct params"
		);
	});
});
