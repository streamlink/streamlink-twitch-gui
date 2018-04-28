import ChatProviderBasic from "./-basic";
import { chattyParameters } from "./chatty";


/**
 * @class ChatProviderChattyStandalone
 * @implements ChatProviderBasic
 */
export default class ChatProviderChattyStandalone extends ChatProviderBasic {
	async _getParameters() {
		const parameters = await super._getParameters( ...arguments );
		parameters.unshift( ...chattyParameters );

		return parameters;
	}
}
