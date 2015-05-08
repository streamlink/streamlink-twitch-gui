define([
	"nwGui",
	"nwWindow",
	"ember",
	"controllers/RetryTransitionMixin"
], function( nwGui, nwWindow, Ember, RetryTransitionMixin ) {

	var get   = Ember.get,
	    set   = Ember.set;

	var reURI   = /^([a-z]+):\/\/([\w-]+(?:\.[\w-]+)*)\/?/;
	var reToken = /^[a-z\d]{30}$/i;


	function containsAll() {
		for ( var i = 0, l = arguments.length; i < l; i++ ) {
			if ( this.indexOf( arguments[ i ] ) < 0 ) { return false; }
		}
		return true;
	}


	return Ember.Controller.extend( Ember.Evented, RetryTransitionMixin, {
		metadata: Ember.inject.service(),

		config: Ember.computed.readOnly( "metadata.package.config" ),

		redirectEnabled: false,

		auth_win: null,
		auth_lock: false,
		auth_failure: false,

		auth_win_lock: Ember.computed.notEmpty( "auth_win" ),

		auth_scope: Ember.computed.readOnly( "config.twitch-oauth-scope" ),

		auth_url: function() {
			var baseuri     = get( this, "config.twitch-oauth-base-uri" ),
			    clientid    = get( this, "config.twitch-oauth-client-id" ),
			    redirecturi = get( this, "config.twitch-oauth-redirect-uri" ),
			    scope       = get( this, "auth_scope" );

			return baseuri
				.replace( "{client-id}", clientid )
				.replace( "{redirect-uri}", encodeURIComponent( redirecturi ) )
				.replace( "{scope}", scope.join( "+" ) );
		}.property( "config", "auth_scope" ),


		enableRedirect: function() {
			if ( this.redirectEnabled ) { return; }

			var src = reURI.exec( get( this, "config.twitch-oauth-base-uri" ) ),
			    dst = reURI.exec( get( this, "config.twitch-oauth-redirect-uri" ) );

			if ( !src || !dst ) {
				throw new Error( "Invalid oauth parameters" );
			}

			// enable the redirect from https://api.twitch.tv to app://livestreamer-twitch-gui
			nwGui.App.addOriginAccessWhitelistEntry( src[0], dst[1], dst[2], true );
			this.redirectEnabled = true;
		},


		check: function() {
			var token = get( this, "auth.access_token" );
			this.login( token, true ).catch(function(){});
		}.on( "init" ),


		/**
		 * Update the adapter and try to authenticate with the given access token
		 * @param {string} token
		 * @param {boolean} isAutoLogin
		 * @returns {Promise}
		 */
		login: function( token, isAutoLogin ) {
			var self  = this,
			    auth  = self.auth;

			// no token set
			if ( !token || !reToken.test( token ) ) { return Promise.reject(); }

			set( auth, "isPending", true );

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
						set( auth, "user_name", name );
					});
				})
				// SUCCESS
				.then(function() {
					set( auth, "isPending", false );
					self.trigger( "login", true );
				})
				// FAILURE: reset the adapter
				.catch(function( err ) {
					self.updateAdapter( null );
					set( auth, "isPending", false );
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
			var valid = get( record, "valid" ),
			    name  = get( record, "user_name" ),
			    scope = get( record, "authorization.scopes" );

			return valid === true
			    && name
			    && name.length
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
			var expected = get( this, "auth_scope" );

			return scope instanceof Array
			    && containsAll.apply( scope, expected );
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
			    && token.length
			    && scope
			    && scope.length
			    && this.validateScope( scope.split( "+" ) )
				? this.login( token, false )
				: Promise.reject();
		},


		/**
		 * Update the auth record and save it
		 * @param {string} token
		 * @param {DS.Model} record
		 * @returns {Promise}
		 */
		sessionSave: function( token, record ) {
			return this.auth.setProperties({
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
			return this.auth.setProperties({
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
		},


		actions: {
			"signin": function() {
				if ( get( this, "auth_win" ) ) { return; }

				var self = this;

				function callback( hash ) {
					var params = self.parseParams( hash );

					self.auth_win.close();

					self.validateOAuthResponse( params[ "access_token" ], params[ "scope" ] )
						// user is logged in! return to previous route
						.then( self.retryTransition.bind( self, "user.index" ) )
						.catch(function() {
							set( self, "auth_failure", true );
						});
				}

				function onClosed() {
					set( self, "auth_win", null );
					delete window.OAUTH_CALLBACK;
					nwWindow.cookiesRemoveAll();
				}

				// prepare...
				set( self, "auth_failure", false );
				self.enableRedirect();
				nwWindow.cookiesRemoveAll();
				window.OAUTH_CALLBACK = callback;

				// open window
				var auth_win = nwGui.Window.open(
					get( self, "auth_url" ),
					get( self, "oauth.window" )
				);
				auth_win.on( "closed", onClosed );
				set( self, "auth_win", auth_win );
			},

			"signout": function() {
				this.sessionReset();
				this.updateAdapter();
			}
		}
	});

});
