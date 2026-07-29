import ChatProviderBasic from "./-basic";
import whichFallback from "utils/node/fs/whichFallback";
import { isFile } from "utils/node/fs/stat";
import Parameter from "utils/parameters/Parameter";


/**
 * @class ChatProviderJava
 * @implements ChatProviderBasic
 * @abstract
 */
export default class ChatProviderJava extends ChatProviderBasic {
	async _getContext( config, userConfig ) {
		const context = await super._getContext( ...arguments );
		context.jar = userConfig[ "jar" ]
			? await whichFallback( userConfig[ "jar" ], null, isFile )
			// only look for the file in the defined fallback paths
			: await whichFallback( config[ "jar" ], config[ "jarfallback" ], isFile, true );

		return context;
	}

	async _getParameters() {
		const parameters = await super._getParameters( ...arguments );
		parameters.unshift(
			new Parameter( "-jar", null, "jar" )
		);

		return parameters;
	}
}
