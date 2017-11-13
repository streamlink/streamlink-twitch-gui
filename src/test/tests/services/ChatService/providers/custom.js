import {
	module,
	test
} from "qunit";
import chatProviderCustomInjector from "inject-loader!services/ChatService/providers/custom";


module( "services/ChatService/providers/custom" );


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
