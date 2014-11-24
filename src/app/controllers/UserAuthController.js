define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set,
		reURI = /^([a-z]+):\/\/([\w-]+(?:\.[\w-]+)*)\/?/;


	return Ember.Controller.extend( Ember.Evented, {
		configBinding: "metadata.package.config",
		redirectEnabled: false,

		previousTransition: null,

		auth_win: null,
		auth_failure: false,

		auth_scope: function() {
			return get( this, "config.twitch-oauth-scope" ).join( "+" );
		}.property( "config" ),

		auth_url: function() {
			var	baseuri		= get( this, "config.twitch-oauth-base-uri" ),
				clientid	= get( this, "config.twitch-oauth-client-id" ),
				redirecturi	= get( this, "config.twitch-oauth-redirect-uri" ),
				scope		= get( this, "auth_scope" );
			return baseuri
				.replace( "{client-id}", clientid )
				.replace( "{redirect-uri}", encodeURIComponent( redirecturi ) )
				.replace( "{scope}", scope );
		}.property( "config", "auth_scope" ),


		enableRedirect: function() {
			if ( this.redirectEnabled ) { return; }

			var	src	= reURI.exec( get( this, "config.twitch-oauth-base-uri" ) ),
				dst	= reURI.exec( get( this, "config.twitch-oauth-redirect-uri" ) );

			if ( !src || !dst ) {
				throw new Error( "Invalid oauth parameters" );
			}

			// enable the redirect from https://api.twitch.tv to app://livestreamer-twitch-gui
			this.nwGui.App.addOriginAccessWhitelistEntry( src[0], dst[1], dst[2], true );
			this.redirectEnabled = true;
		},

		validateToken: function() {
			var	self	= this,
				auth	= self.auth,
				token	= get( auth, "access_token" ),
				defer;

			// no token set
			if ( !token ) { return Promise.reject(); }

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


		actions: {
			"signin": function() {
				if ( this.auth_win ) { return; }

				var self = this;

				function callback( hash ) {
					var	params	= self.parseParams( hash ),
						token	= params[ "access_token" ],
						scope	= params[ "scope" ];

					// check the returned token and compare scopes
					if ( !token || !token.length || scope !== get( self, "auth_scope" ) ) {
						set( self, "auth_failure", true );

					} else {
						// save the token for now
						self.auth.sessionPrepare( token, scope );
						// and validate it
						self.validateToken()
							// user is logged in! return to previous route
							.then( self.returnToPreviousRoute.bind( self ) )
							// something stupid happened
							.catch(function() {
								set( self, "auth_failure", true );
								// reset auth record
								self.auth.sessionReset();
							});
					}

					self.auth_win.close();
				}

				function onClosed() {
					self.auth_win = null;
					delete window.OAUTH_CALLBACK;
					self.nwWindow.cookiesRemoveAll();
				}

				// prepare...
				set( self, "auth_failure", false );
				self.enableRedirect();
				self.nwWindow.cookiesRemoveAll();
				window.OAUTH_CALLBACK = callback;

				// open window
				self.auth_win = self.nwGui.Window.open(
					get( self, "auth_url" ),
					get( self, "oauth.window" )
				);
				self.auth_win.on( "closed", onClosed );
			},

			"signout": function() {
				this.auth.sessionReset()
					.then( this.updateAdapter.bind( this ) );
			}
		}
	});

});
