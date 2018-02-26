import { get, set, getProperties, setProperties, computed } from "@ember/object";
import Evented from "@ember/object/evented";
import { default as Service, inject as service } from "@ember/service";
import { twitch } from "config";
import { setFocused } from "nwjs/Window";
import { openBrowser } from "nwjs/Shell";
import { all } from "utils/contains";
import HttpServer from "utils/node/http/HttpServer";
import OAuthResponseRedirect from "root/oauth-redirect.html";


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
		"scope": scope
	}
} = twitch;

const reToken = /^[a-z\d]{30}$/i;


export default Service.extend( Evented, {
	store: service(),

	session: null,
	server: null,

	url: computed(function() {
		let redirect = redirecturi.replace( "{server-port}", String( serverport ) );

		return baseuri
			.replace( "{client-id}", clientid )
			.replace( "{redirect-uri}", encodeURIComponent( redirect ) )
			.replace( "{scope}", scope.join( "+" ) );
	}),


	init() {
		const store = get( this, "store" );
		store.findOrCreateRecord( "auth" )
			.then( session => {
				set( this, "session", session );

				// startup auto login
				let token = get( session, "access_token" );
				this.login( token, true )
					.catch( () => {} );

				// trigger event after calling login, so `isPending` can be set first
				this.trigger( "initialized" );
			});
	},



	/**
	 * Signout and reset session
	 * @returns {Promise}
	 */
	signout() {
		this.updateAdapter( null );
		return this.sessionReset();
	},

	/**
	 * Open OAuth url in browser
	 * @returns {Promise}
	 */
	signin() {
		if ( get( this, "server" ) ) {
			return Promise.reject();
		}

		return new Promise( ( resolve, reject ) => {
			let server = new HttpServer( serverport, 1000 );
			set( this, "server", server );

			server.onRequest( "GET", "/redirect", ( req, res ) => {
				res.end( OAuthResponseRedirect );
				return true;
			});

			server.onRequest( "GET", "/token", ( req, res ) => {
				let { access_token: token, scope } = req.url.query;

				// validate token and scope and keep the request open
				this.validateOAuthResponse( token, scope )
					.finally( () => res.end() )
					.then( data => {
						// send 200
						resolve( data );
					}, err => {
						// send 500
						res.statusCode = 500;
						reject( err );
					});

				return true;
			});

			// open auth url in web browser
			let url = get( this, "url" );
			openBrowser( url )
				.catch( reject );
		})
			// shut down server and focus the application window when done
			.finally( () => {
				this.abortSignin();
				setFocused( true );
			});
	},

	abortSignin() {
		let server = get( this, "server" );
		if ( !server ) { return; }
		server.close();
		set( this, "server", null );
	},

	/**
	 * Validate the OAuth response after a login attempt
	 * @param {String} token
	 * @param {String} scope
	 * @returns {Promise}
	 */
	validateOAuthResponse( token, scope ) {
		// check the returned token and validate scopes
		return token
		    && token.length > 0
		    && scope
		    && scope.length > 0
		    && this.validateScope( scope.split( " " ) )
			? this.login( token, false )
			: Promise.reject();
	},

	/**
	 * Update the adapter and try to authenticate with the given access token
	 * @param {String} token
	 * @param {Boolean} isAutoLogin
	 * @returns {Promise}
	 */
	login( token, isAutoLogin ) {
		// no token set
		if ( !token || !reToken.test( token ) ) {
			return Promise.reject();
		}

		set( this, "session.isPending", true );

		// tell the twitch adapter to use the token from now on
		this.updateAdapter( token );

		// validate session
		return this.validateSession()
			// logged in...
			.then( record => {
				let promise = isAutoLogin
					? Promise.resolve()
					// save auth record if this was no auto login
					: this.sessionSave( token, record );

				// also don't forget to set the user_name on the auth record (volatile)
				return promise.then( () => {
					let { user_id, user_name } = getProperties( record, "user_id", "user_name" );
					let session = get( this, "session" );
					setProperties( session, { user_id, user_name } );
				});
			})
			// SUCCESS
			.then( () => {
				set( this, "session.isPending", false );
				this.trigger( "login", true );
			})
			// FAILURE: reset the adapter
			.catch( err => {
				this.updateAdapter( null );
				set( this, "session.isPending", false );
				this.trigger( "login", false );

				return Promise.reject( err );
			});
	},

	/**
	 * Adapter was updated. Now check if the access token is valid.
	 * @returns {Promise}
	 */
	validateSession() {
		// validate token
		const store = get( this, "store" );

		return store.queryRecord( "twitchRoot", {} )
			.then( record => this.validateToken( record ) );
	},

	/**
	 * Validate access token response
	 * @param {TwitchRoot} record
	 * @returns {Promise}
	 */
	validateToken( record ) {
		let valid = get( record, "valid" );
		let name = get( record, "user_name" );
		let scopes = get( record, "scopes" );

		return valid === true
		    && name
		    && name.length > 0
		    && this.validateScope( scopes )
			? Promise.resolve( record )
			: Promise.reject( new Error( "Invalid access token" ) );
	},

	/**
	 * Received and expected scopes need to be identical
	 * @param {String[]} returnedScope
	 * @returns {boolean}
	 */
	validateScope( returnedScope ) {
		return returnedScope instanceof Array
		    && all.apply( returnedScope, scope );
	},


	/**
	 * Update the auth record and save it
	 * @param {String} token
	 * @param {TwitchRoot} record
	 * @returns {Promise}
	 */
	sessionSave( token, record ) {
		let session = get( this, "session" );
		setProperties( session, {
			access_token: token,
			scope: get( record, "scopes" ).join( "+" ),
			date: new Date()
		});

		return session.save();
	},

	/**
	 * Clear auth record and save it
	 * @returns {Promise}
	 */
	sessionReset() {
		let session = get( this, "session" );
		setProperties( session, {
			access_token: null,
			scope: null,
			date: null,
			user_id: null,
			user_name: null
		});

		return session.save();
	},


	updateAdapter( token ) {
		let adapter = get( this, "store" ).adapterFor( "twitch" );
		if ( !adapter ) {
			throw new Error( "Adapter not found" );
		}

		set( adapter, "access_token", token );
	}
});
