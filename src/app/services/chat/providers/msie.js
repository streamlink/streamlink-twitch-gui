import ChatProvider from "./-provider";
import resolvePath from "utils/node/resolvePath";
import { stat, isFile } from "utils/node/fs/stat";
import whichFallback from "utils/node/fs/whichFallback";
import Parameter from "utils/parameters/Parameter";


/**
 * @class ChatProviderMsie
 * @implements ChatProvider
 */
export default class ChatProviderMsie extends ChatProvider {
	// noinspection JSCheckFunctionSignatures
	async _getExec( config ) {
		return await whichFallback( config[ "exec" ], config[ "fallback" ], null, true );
	}

	// noinspection JSCheckFunctionSignatures
	async _getContext( config ) {
		const script = resolvePath( config[ "data" ][ "script" ] );
		await stat( script, isFile );

		return { script };
	}

	// noinspection JSCheckFunctionSignatures
	async _getParameters() {
		return [
			new Parameter( null, null, "script" ),
			new Parameter( null, null, "url" )
		];
	}

	// noinspection JSCheckFunctionSignatures
	_getRuntimeContext({ name: channel }) {
		const url = this._getUrl( channel );

		return Object.assign( {}, this.context, { url } );
	}
}
