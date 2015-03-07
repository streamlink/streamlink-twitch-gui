define( [ "nwGui", "nwWindow", "ember" ], function( nwGui, nwWindow, Ember ) {

	var get   = Ember.get,
	    set   = Ember.set;

	var reURI   = /^([a-z]+):\/\/([\w-]+(?:\.[\w-]+)*)\/?/;
	var reToken = /^[a-z\d]{30}$/i;


	return Ember.Controller.extend( Ember.Evented, {
		config: Ember.computed.readOnly( "metadata.package.config" ),
		redirectEnabled: false,

		previousTransition: null,

		auth_win: null,
		auth_lock: false,
		auth_failure: false,

		auth_win_lock: Ember.computed.notEmpty( "auth_win" ),

		auth_scope: function() {
			return get( this, "config.twitch-oauth-scope" ).join( "+" );
		}.property( "config" ),

		auth_url: function() {
			var baseuri     = get( this, "config.twitch-oauth-base-uri" ),
			    clientid    = get( this, "config.twitch-oauth-client-id" ),
			    redirecturi = get( this, "config.twitch-oauth-redirect-uri" ),
			    scope       = get( this, "auth_scope" );

			return baseuri
				.replace( "{client-id}", clientid )
				.replace( "{redirect-uri}", encodeURIComponent( redirecturi ) )
				.replace( "{scope}", scope );
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
			this.validateToken().catch(function(){});
		}.on( "init" ),


		validateToken: function() {
			var self  = this,
			    auth  = self.auth,
			    token = get( auth, "access_token" ),
			    defer;

			// no token set
			if ( !token || !reToken.test( token ) ) { return Promise.reject(); }

			defer = Promise.defer();
			set( auth, "isPending", true );

			// tell the twitch adapter to use the token from now on
			self.updateAdapter( token );

			// validate token
			self.store.findAll( "twitchToken", null )
				.then(function( records ) { return records.objectAt( 0 ); })
				// validate and store token
				.then( auth.sessionValidate.bind( auth ) )
				.then(function() {
					// success
					set( auth, "isPending", false );
					self.trigger( "login", true );
					defer.resolve();
				})
				.catch(function( err ) {
					// reset the adapter
					self.updateAdapter( null );
					set( auth, "isPending", false );
					self.trigger( "login", false );
					defer.reject( err );
				});

			return defer.promise;
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

		returnToPreviousRoute: function() {
			var previousTransition = get( this, "previousTransition" );
			if ( previousTransition ) {
				set( this, "previousTransition", null );
				previousTransition.retry();
			} else {
				this.transitionToRoute( "user.index" );
			}
		},

		authenticate: function( token, scope ) {
			// check the returned token and compare scopes
			if ( !token || !token.length || scope !== get( this, "auth_scope" ) ) {
				return Promise.reject();
			}

			// save the token for now
			this.auth.sessionPrepare( token, scope );

			// and validate it
			return this.validateToken()
				// something stupid happened
				.catch(function( err ) {
					// reset auth record
					this.auth.sessionReset();
					return Promise.reject( err );
				}.bind( this ) );
		},


		actions: {
			"signin": function() {
				if ( get( this, "auth_win" ) ) { return; }

				var self = this;

				function callback( hash ) {
					var params = self.parseParams( hash );

					self.auth_win.close();

					self.authenticate( params[ "access_token" ], params[ "scope" ] )
						// user is logged in! return to previous route
						.then( self.returnToPreviousRoute.bind( self ) )
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
				this.auth.sessionReset()
					.then( this.updateAdapter.bind( this ) );
			}
		}
	});

});
