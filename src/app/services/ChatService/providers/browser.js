import ChatProvider from "./-provider";
import { Shell } from "nwjs/nwGui";


const { openExternal } = Shell;


/**
 * @class ChatProviderBrowser
 * @implements ChatProvider
 */
export default class ChatProviderBrowser extends ChatProvider {
	// noinspection JSCheckFunctionSignatures
	async setup( config, userConfig = {} ) {
		this.context = await this._getContext( config, userConfig );
	}

	// noinspection JSCheckFunctionSignatures
	async launch({ name: channel }) {
		const url = this._getUrl( channel );
		openExternal( url );
	}
}
