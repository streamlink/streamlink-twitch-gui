import { get, getProperties } from "@ember/object";
import { on } from "@ember/object/evented";
import { default as Service, inject as service } from "@ember/service";
import { chat as chatConfig } from "config";
import providers from "./providers";


const { hasOwnProperty } = {};


/** @type {Map<string,ChatProvider>} */
export const providerInstanceMap = new Map();
/** @type {Map<string,Promise>} */
export const providerSetupMap = new Map();


export default Service.extend({
	auth: service(),
	settings: service(),

	_resetProviders: on( "init", function() {
		const settingsService = get( this, "settings" );
		settingsService.on( "didUpdate", () => {
			providerInstanceMap.clear();
			providerSetupMap.clear();
		});
	}),

	async openChat( twitchChannel ) {
		/** @type {ChatProvider} */
		const provider = await this._getChatProvider();

		/** @type {{name: string}} */
		const channelData = twitchChannel.toJSON();
		const session = get( this, "auth.session" );
		/** @type {Object} */
		const sessionData = getProperties( session, "access_token", "user_name", "isLoggedIn" );

		await provider.launch( channelData, sessionData );
	},

	async _getChatProvider() {
		const provider = get( this, "settings.chat.provider" );
		if ( !hasOwnProperty.call( providers, provider ) ) {
			throw new Error( `Invalid provider: ${provider}` );
		}

		const providersUserData = get( this, "settings.chat.providers" ).toJSON();
		if ( !hasOwnProperty.call( providersUserData, provider ) ) {
			throw new Error( `Missing chat provider settings: ${provider}` );
		}

		/** @type {ChatProvider} */
		let inst;
		/** @type {Promise} */
		let setup;

		if ( !providerInstanceMap.has( provider ) ) {
			// create instance
			inst = new providers[ provider ]();
			providerInstanceMap.set( provider, inst );
			// execute async setup method
			setup = inst.setup( chatConfig[ provider ], providersUserData[ provider ] );
			providerSetupMap.set( provider, setup );
		} else {
			inst = providerInstanceMap.get( provider );
			setup = providerSetupMap.get( provider );
		}

		// wait for provider setup to finish
		await setup;

		return inst;
	}
});
