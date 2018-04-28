import { module, test } from "qunit";

import chatProviderCustomInjector from "inject-loader!services/chat/providers/custom";


module( "services/chat/providers/custom" );


test( "Exports ChatProviderBasic", assert => {

	const ChatProviderBasic = class {};

	const { default: ChatProviderCustom } = chatProviderCustomInjector({
		"./-basic": ChatProviderBasic
	});

	assert.strictEqual(
		ChatProviderCustom,
		ChatProviderBasic,
		"Exports the basic chat provider"
	);

});
