import { module, test } from "qunit";

import chatProviderChromeInjector from "inject-loader!services/ChatService/providers/chrome";


module( "services/ChatService/providers/chrome" );


test( "Exports ChatProviderChromium", assert => {

	const ChatProviderChromium = class {};

	const { default: ChatProviderChrome } = chatProviderChromeInjector({
		"./chromium": ChatProviderChromium
	});

	assert.strictEqual(
		ChatProviderChrome,
		ChatProviderChromium,
		"Exports the Chromium chat provider"
	);

});
