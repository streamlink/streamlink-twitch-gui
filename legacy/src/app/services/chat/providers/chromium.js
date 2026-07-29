import ChatProviderBasic from "./-basic";
import ParameterCustom from "utils/parameters/ParameterCustom";
import Substitution from "utils/parameters/Substitution";


/**
 * @class ChatProviderChromium
 * @implements ChatProviderBasic
 */
export default class ChatProviderChromium extends ChatProviderBasic {
	// noinspection JSCheckFunctionSignatures
	async _getContext() {
		const context = await super._getContext( ...arguments );
		context.chromiumArgs = "\"--app={url}\"";

		return context;
	}

	async _getParameters() {
		const parameters = await super._getParameters( ...arguments );
		parameters.unshift(
			new ParameterCustom( null, "chromiumArgs", [
				new Substitution( "url", "url" )
			])
		);

		return parameters;
	}
}
