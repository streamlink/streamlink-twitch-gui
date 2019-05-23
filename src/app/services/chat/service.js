import { default as Service, inject as service } from "@ember/service";
import { on } from "@ember-decorators/object";
import { chat as chatConfig } from "config";
import providers from "./providers";
import { logDebug, logError } from "./logger";


const { hasOwnProperty } = {};


/** @type {Map<string,ChatProvider>} */
export const providerInstanceMap = new Map();
/** @type {Map<string,Promise>} */
export const providerSetupMap = new Map();


export default class ChatService extends Service {
	/** @type {AuthService} */
	@service auth;
	/** @type {SettingsService} */
	@service settings;

	@on( "init" )
	_resetProviders() {
		this.settings.on( "didUpdate", () => {
			providerInstanceMap.clear();
			providerSetupMap.clear();
		});
	}

	/**
	 * @param {TwitchChannel} twitchChannel
	 * @returns {Promise}
	 */
	async openChat( twitchChannel ) {
		const channelData = twitchChannel.toJSON();
		const { access_token, user_name, isLoggedIn } = this.auth.session.toJSON();

		await logDebug( "Preparing to launch chat", {
			channel: channelData.name,
			user: user_name
		});

		try {
			/** @type {ChatProvider} */
			const provider = await this._getChatProvider();
			await provider.launch( channelData, { access_token, user_name, isLoggedIn } );

		} catch ( error ) {
			await logError( error );
			throw error;
		}
	}

	async _getChatProvider() {
		const provider = this.settings.content.chat.provider;
		if ( !hasOwnProperty.call( providers, provider ) ) {
			throw new Error( `Invalid provider: ${provider}` );
		}

		const providersUserData = this.settings.content.chat.providers.toJSON();
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

			await logDebug(
				"Resolving chat provider",
				{
					provider,
					providerUserData: providersUserData[ provider ]
				}
			);

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
}
