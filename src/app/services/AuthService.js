define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/redirect",
	"nwjs/cookies",
	"utils/contains",
	"text!root/oauth.json"
], function(
	Ember,
	nwGui,
	redirect,
	cookies,
	contains,
	OAuth
) {

	OAuth = JSON.parse( OAuth );

	var get = Ember.get,
	    set = Ember.set;

	var reToken = /^[a-z\d]{30}$/i;


	return Ember.Service.extend( Ember.Evented, {
		metadata: Ember.inject.service(),

		config: Ember.computed.alias( "metadata.config" ),
		scope : Ember.computed.alias( "config.twitch-oauth-scope" ),

		session: null,

		window: null,

		url: function() {
			var baseuri     = get( this, "config.twitch-oauth-base-uri" );
			var clientid    = get( this, "config.twitch-oauth-client-id" );
			var redirecturi = get( this, "config.twitch-oauth-redirect-uri" );
			var scope       = get( this, "scope" );

			return baseuri
				.replace( "{client-id}", clientid )
				.replace( "{redirect-uri}", encodeURIComponent( redirecturi ) )
				.replace( "{scope}", scope.join( "+" ) );
		}.property( "config", "scope" ),


		init: function() {
			var self = this;
			// FIXME: remove this and use service injection. requires EmberData upgrade
			self.store = self.container.lookup( "store:main" );

			self.store.find( "auth" )
				.then(function( records ) {
					return records.content.length
						? records.objectAt( 0 )
						: self.store.createRecord( "auth", { id: 1 } ).save();
				})
				.then(function( session ) {
					set( self, "session", session );

					// startup auto login
					var token = get( session, "access_token" );
					self.login( token, true )
						.catch(function() {});

					// trigger event after calling login, so `isPending` can be set first
					self.trigger( "initialized" );
				});
		},



		/**
		 * Signout and reset session
		 * @returns {Promise}
		 */
		signout: function() {
			this.updateAdapter( null );
			return this.sessionReset();
		},

		/**
		 * Open OAuth window
		 * @returns {Promise}
		 */
		signin: function() {
			if ( get( this, "window" ) ) {
				return Promise.reject();
			}

			var self  = this;
			var defer = Promise.defer();

			function callback( hash ) {
				var params = self.parseParams( hash );

				self.validateOAuthResponse( params[ "access_token" ], params[ "scope" ] )
					.then( defer.resolve, defer.reject )
					.then(function() {
						self.window.close();
					});
			}

			function onClosed() {
				set( self, "window", null );
				delete window.OAUTH_CALLBACK;
				cookies.removeAll();
				defer.reject();
			}

			// enable the redirect from https://api.twitch.tv to app://livestreamer-twitch-gui
			redirect.enable(
				get( self, "config.twitch-oauth-base-uri" ),
				get( self, "config.twitch-oauth-redirect-uri" )
			);
			cookies.removeAll();

			window.OAUTH_CALLBACK = callback;

			// open window
			var win = nwGui.Window.open(
				get( self, "url" ),
				OAuth.window
			);
			win.on( "closed", onClosed );
			set( self, "window", win );

			return defer.promise;
		},

		/**
		 * Validate the OAuth response after a login attempt
		 * @param {string} token
		 * @param {string} scope
		 * @returns {Promise}
		 */
		validateOAuthResponse: function( token, scope ) {
			// check the returned token and validate scopes
			return token
			    && token.length > 0
			    && scope
			    && scope.length > 0
			    && this.validateScope( scope.split( "+" ) )
				? this.login( token, false )
				: Promise.reject();
		},

		/**
		 * Update the adapter and try to authenticate with the given access token
		 * @param {string} token
		 * @param {boolean} isAutoLogin
		 * @returns {Promise}
		 */
		login: function( token, isAutoLogin ) {
			var self = this;

			// no token set
			if ( !token || !reToken.test( token ) ) { return Promise.reject(); }

			set( this, "session.isPending", true );

			// tell the twitch adapter to use the token from now on
			self.updateAdapter( token );

			// validate session
			return self.validateSession()
				// logged in...
				.then(function( record ) {
					var promise = isAutoLogin
						? Promise.resolve()
						// save auth record if this was no auto login
						: self.sessionSave( token, record );

					// also don't forget to set the user_name on the auth record (volatile)
					return promise.then(function() {
						var name = get( record, "user_name" );
						set( self, "session.user_name", name );
					});
				})
				// SUCCESS
				.then(function() {
					set( self, "session.isPending", false );
					self.trigger( "login", true );
				})
				// FAILURE: reset the adapter
				.catch(function( err ) {
					self.updateAdapter( null );
					set( self, "session.isPending", false );
					self.trigger( "login", false );

					return Promise.reject( err );
				});
		},

		/**
		 * Adapter was updated. Now check if the access token is valid.
		 * @returns {Promise}
		 */
		validateSession: function() {
			// validate token
			return this.store.findAll( "twitchToken", null )
				.then(function( records ) { return records.objectAt( 0 ); })
				.then( this.validateToken.bind( this ) );
		},

		/**
		 * Validate access token response
		 * @param {DS.Model} record
		 * @returns {Promise}
		 */
		validateToken: function( record ) {
			var valid = get( record, "valid" );
			var name  = get( record, "user_name" );
			var scope = get( record, "authorization.scopes" );

			return valid === true
			    && name
			    && name.length > 0
			    && this.validateScope( scope )
				? Promise.resolve( record )
				: Promise.reject( new Error( "Invalid access token" ) );
		},

		/**
		 * Received and expected scopes need to be identical
		 * @param {Array} scope
		 * @returns {boolean}
		 */
		validateScope: function( scope ) {
			var expected = get( this, "scope" );

			return scope instanceof Array
			    && contains.all.apply( scope, expected );
		},


		/**
		 * Update the auth record and save it
		 * @param {string} token
		 * @param {DS.Model} record
		 * @returns {Promise}
		 */
		sessionSave: function( token, record ) {
			return get( this, "session" ).setProperties({
				access_token: token,
				scope       : get( record, "authorization.scopes" ).join( "+" ),
				date        : new Date()
			}).save();
		},

		/**
		 * Clear auth record and save it
		 * @returns {Promise}
		 */
		sessionReset: function() {
			return get( this, "session" ).setProperties({
				access_token: null,
				scope       : null,
				date        : null,
				user_name   : null
			}).save();
		},


		updateAdapter: function( token ) {
			var adapter = this.container.lookup( "adapter:application" );
			if ( !adapter ) {
				throw new Error( "Adapter not found" );
			}

			set( adapter, "access_token", token );
		},

		parseParams: function( str ) {
			return String( str || "" ).split( "&" )
				.reduce(function( obj, elem ) {
					var split = elem.split( "=" );
					obj[ split.splice( 0, 1 ) ] = split.join( "=" );
					return obj;
				}, {} );
		}
	});

});
