import { set, setProperties, computed } from "@ember/object";
import Evented from "@ember/object/evented";
import { default as Service, inject as service } from "@ember/service";
import { twitch as twitchConfig } from "config";
import HttpServer from "utils/node/http/HttpServer";
import OAuthResponseRedirect from "./oauth-redirect.html";


const {
	oauth: {
		/** @type {String} */
		"base-uri": baseuri,
		/** @type {String} */
		"client-id": clientid,
		/** @type {Number} */
		"server-port": serverport,
		/** @type {String} */
		"redirect-uri": redirecturi,
		/** @type {String[]} */
		"scope": expectedScopes
	}
} = twitchConfig;

const reToken = /^[a-z\d]{30}$/i;


export default class AuthService extends Service.extend( Evented ) {
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {DS.Store} */
	@service store;

	/** @type {Auth} */
	session = null;
	/** @type {HttpServer} */
	server = null;


	@computed()
	get url() {
		const redirect = redirecturi.replace( "{server-port}", String( serverport ) );

		return baseuri
			.replace( "{client-id}", clientid )
			.replace( "{redirect-uri}", encodeURIComponent( redirect ) )
			.replace( "{scope}", expectedScopes.join( "+" ) );
	}


	async autoLogin() {
		await this._loadSession();
		const { access_token } = this.session;

		// not a returning user? just trigger the "initialized" event
		if ( !reToken.test( access_token ) ) {
			this.trigger( "initialized" );
			return;
		}

		// set session.isPending before triggering "initialized"
		set( this.session, "isPending", true );
		this.trigger( "initialized" );

		// then perform auto-login afterwards
		await this.login( access_token, true )
			.catch( /* istanbul ignore next */ () => {} );
	}

	async _loadSession() {
		/** @type {Auth} */
		const session = await this.store.findOrCreateRecord( "auth" );
		set( this, "session", session );
	}


	/**
	 * Signout and reset session
	 * @returns {Promise}
	 */
	async signout() {
		this._updateAdapter( null );
		await this._sessionReset();
	}

	/**
	 * Open OAuth url in browser
	 * @returns {Promise}
	 */
	async signin() {
		if ( this.server ) {
			throw new Error( "An OAuth response server is already running" );
		}

		return new Promise( ( resolve, reject ) => {
			const server = new HttpServer( serverport, 1000 );
			set( this, "server", server );

			server.onRequest( "GET", "/redirect", ( req, res ) => {
				res.end( OAuthResponseRedirect );
				return true;
			});

			server.onRequest( "GET", "/token", async ( req, res ) => {
				const { access_token, scope } = req.url.query;

				// validate token and scope and keep the request open
				await this._validateOAuthResponse( access_token, scope )
					.then( () => {
						res.end( "OK" );
						process.nextTick( resolve );
					}, err => {
						res.statusCode = 500;
						res.end( String( err ) );
						process.nextTick( () => reject( err ) );
					});

				return true;
			});

			// open auth url in web browser
			try {
				this.nwjs.openBrowser( this.url );
			} catch ( err ) {
				reject( err );
			}
		})
			// shut down server and focus the application window when done
			.finally( () => {
				this.abortSignin();
				this.nwjs.focus( true );
			});
	}

	abortSignin() {
		const { server } = this;
		if ( !server ) { return; }
		server.close();
		set( this, "server", null );
	}

	/**
	 * Validate the OAuth response after a login attempt
	 * @param {string} token
	 * @param {string} scope
	 * @returns {Promise}
	 */
	async _validateOAuthResponse( token, scope ) {
		// check the returned token and validate scopes
		if ( !reToken.test( token ) || !this._validateScope( String( scope ).split( " " ) ) ) {
			throw new Error( "OAuth token validation error" );
		}

		return await this.login( token, false );
	}

	/**
	 * Update the adapter and try to authenticate with the given access token
	 * @param {string} token
	 * @param {boolean} isAutoLogin
	 * @returns {Promise}
	 */
	async login( token, isAutoLogin ) {
		const { session } = this;
		let success = false;
		set( session, "isPending", true );

		try {
			// tell the twitch adapter to use the token from now on
			this._updateAdapter( token );

			// validate session
			const record = await this._validateSession();

			if ( !isAutoLogin ) {
				// save auth record if this was no auto login
				await this._sessionSave( token, record );
			}

			// also don't forget to set the user_name on the auth record (regular properties)
			const { user_id, user_name } = record;
			setProperties( session, { user_id, user_name } );
			success = true;

		} catch ( err ) {
			// FAILURE: reset the adapter
			this._updateAdapter( null );

			throw err;

		} finally {
			set( session, "isPending", false );
			this.trigger( "login", success );
		}
	}

	/**
	 * Adapter was updated. Now check if the access token is valid.
	 * @returns {Promise<TwitchRoot>}
	 */
	async _validateSession() {
		/** @type {TwitchRoot} */
		const twitchRoot = await this.store.queryRecord( "twitch-root", {} );
		const { valid, user_name, scopes } = twitchRoot.toJSON();

		if ( valid !== true || !user_name || !this._validateScope( scopes ) ) {
			throw new Error( "Invalid session" );
		}

		return twitchRoot;
	}

	/**
	 * Received and expected scopes need to be identical
	 * @param {string[]} returnedScopes
	 * @returns {boolean}
	 */
	_validateScope( returnedScopes ) {
		return Array.isArray( returnedScopes )
		    && expectedScopes.every( item => returnedScopes.includes( item ) );
	}


	/**
	 * Update the auth record and save it
	 * @param {string} access_token
	 * @param {TwitchRoot} twitchRoot
	 * @returns {Promise}
	 */
	async _sessionSave( access_token, twitchRoot ) {
		const { session } = this;
		const scope = twitchRoot.scopes.content.join( "+" );
		const date = new Date();
		setProperties( session, { access_token, scope, date } );

		await session.save();
	}

	/**
	 * Clear auth record and save it
	 * @returns {Promise}
	 */
	async _sessionReset() {
		const { session } = this;
		setProperties( session, {
			access_token: null,
			scope: null,
			date: null,
			user_id: null,
			user_name: null
		});

		await session.save();
	}

	/**
	 * @param {string} token
	 */
	_updateAdapter( token ) {
		const adapter = this.store.adapterFor( "twitch" );
		set( adapter, "access_token", token );
	}
}
