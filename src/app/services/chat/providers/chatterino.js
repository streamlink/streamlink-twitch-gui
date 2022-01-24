import ChatProviderBasic from "./-basic";
import Parameter from "utils/parameters/Parameter";


/**
 * @class ChatProviderChatterino
 * @implements ChatProviderBasic
 */
export default class ChatProviderChatterino extends ChatProviderBasic {
	// noinspection JSCheckFunctionSignatures
	async _getParameters() {
		return [
			new Parameter( "--channels", null, "channel" )
		];
	}

	// noinspection JSCheckFunctionSignatures
	_getRuntimeContext( channel ) {
		return Object.assign( {}, this.context, {
			channel: `t:${channel}`
		});
	}
}
