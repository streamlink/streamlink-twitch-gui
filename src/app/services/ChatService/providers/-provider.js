import { twitch as twitchConfig } from "config";
import launch from "../launch";
import Parameter from "utils/parameters/Parameter";


const { "chat-url": twitchChatUrl } = twitchConfig;
const { getParameters } = Parameter;
const { isArray } = Array;
const { hasOwnProperty } = {};


/**
 * @class ChatProvider
 * @abstract
 * @property {string} exec
 * @property {Object} context
 * @property {Parameter[]} parameters
 */
export default class ChatProvider {
	/**
	 * Perform a one time setup
	 * @param {Object} config
	 * @param {Object[]} [config.attributes]
	 * @param {Object} [userConfig]
	 * @returns {Promise}
	 */
	async setup( config, userConfig = {} ) {
		this.exec = await this._getExec( config, userConfig );
		this.context = await this._getContext( config, userConfig );
		this.parameters = await this._getParameters( config, userConfig );
	}

	/**
	 * Launch the provider process
	 * @param {Object} channel
	 * @param {string} channel.name
	 * @param {Object} [session]
	 * @param {string} [session.access_token]
	 * @param {string} [session.user_name]
	 * @param {boolean} [session.isLoggedIn]
	 * @returns {Promise}
	 */
	async launch( channel, session = {} ) {
		const context = this._getRuntimeContext( channel, session );
		const params = getParameters( context, this.parameters );

		await launch( this.exec, params );
	}

	/**
	 * Resolve the provider's executable path
	 * @param {Object} config
	 * @param {Object[]} [config.attributes]
	 * @param {Object} userConfig
	 * @returns {Promise.<string>}
	 */
	// eslint-disable-next-line no-unused-vars
	async _getExec( config, userConfig ) {
		throw new Error( "Not implemented" );
	}

	/**
	 * Set the provider's static parameters context
	 * @param {Object} config
	 * @param {Object[]} [config.attributes]
	 * @param {Object} userConfig
	 * @returns {Promise.<Object>}
	 */
	async _getContext( config, userConfig ) {
		const context = {};
		const { attributes } = config;

		// set all of the user's param values in the context object
		if ( isArray( attributes ) ) {
			for ( const { name } of attributes ) {
				context[ name ] = userConfig[ name ];
			}
		}

		return context;
	}

	/**
	 * Define the provider's parameters list
	 * @param {Object} config
	 * @param {Object[]} [config.attributes]
	 * @param {Object} userConfig
	 * @returns {Promise.<Parameter[]>}
	 */
	// eslint-disable-next-line no-unused-vars
	async _getParameters( config, userConfig ) {
		return [];
	}

	/**
	 * Get the runtime context object
	 * @param {Object} channel
	 * @param {string} channel.name
	 * @param {Object} session
	 * @param {string} [session.access_token]
	 * @param {string} [session.user_name]
	 * @param {boolean} [session.isLoggedIn]
	 * @returns {Object}
	 */
	// eslint-disable-next-line no-unused-vars
	_getRuntimeContext( channel, session ) {
		return this.context;
	}

	/**
	 * Get the Twitch chat URL
	 * @param {string} channel
	 * @returns {string}
	 */
	_getUrl( channel ) {
		const chat = hasOwnProperty.call( this.context, "url" )
			? this.context.url
			: "default";
		const url = hasOwnProperty.call( twitchChatUrl, chat )
			? twitchChatUrl[ chat ]
			: twitchChatUrl.default;

		return url.replace( "{channel}", channel );
	}
}
