import ChatProvider from "./-provider";
import { openBrowser } from "nwjs/Shell";


const { chatUrl } = ChatProvider;


/**
 * @class ChatProviderBrowser
 * @implements ChatProvider
 */
export default class ChatProviderBrowser extends ChatProvider {
	// noinspection JSCheckFunctionSignatures
	async setup() {}

	// noinspection JSCheckFunctionSignatures
	async launch( channel ) {
		await openBrowser( chatUrl, { channel: channel.name } );
	}
}
