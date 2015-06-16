define([
	"Ember",
	"utils/wait",
	"text!templates/user/auth.html.hbs"
], function( Ember, wait, template ) {

	var get  = Ember.get,
	    set  = Ember.set,
	    setP = Ember.setProperties;

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-auth" ],

		failure  : false,
		tokenForm: false,
		lock     : false,

		windowObserver: function() {
			if ( get( this, "controller.auth.window" ) ) {
				set( this, "tokenForm", false );
			}
		}.observes( "controller.auth.window" ),

		token: "",

		tokenBtnClass: "",
		tokenBtnIcon : "fa-sign-in",

		actions: {
			"showTokenForm": function() {
				setP( this, {
					failure  : false,
					tokenForm: true
				});

				Ember.run.next( this, function() {
					this.$( "input" ).focus();
				});
			},

			"inputAction": function() {
				this.$( "input + .input-group-btn > button" ).click();
			},

			// login via user and password
			"signin": function() {
				var self       = this;
				var controller = get( self, "controller" );
				var auth       = get( controller, "auth" );

				auth.signin()
					.then(function() {
						controller.retryTransition( "user.index" );
					}, function() {
						set( self, "failure", true );
					});
			},

			// login via access token
			"signinToken": function( callback ) {
				var self       = this;
				var controller = get( self, "controller" );
				var token      = get( self, "token" );
				var auth       = get( controller, "auth" );

				if ( get( self, "lock" ) || get( auth, "window" ) ) {
					return;
				}

				Promise.resolve()
					// show the loading icon for a sec
					.then(function() {
						setP( self, {
							failure      : false,
							lock         : true,
							tokenBtnClass: "btn-info",
							tokenBtnIcon : "fa-refresh fa-spin"
						});
					})
					.then( wait( 1000 ) )
					// login attempt
					.then( auth.login.bind( auth, token, false ) )
					// login response
					.then(function() {
						setP( self, {
							tokenBtnClass: "btn-success",
							tokenBtnIcon : "fa-check"
						});
						return true;
					}, function() {
						setP( self, {
							failure      : true,
							tokenBtnClass: "btn-danger",
							tokenBtnIcon : "fa-times"
						});
						return false;
					})
					// wait another sec and animate icon
					.then( wait( 1000 ) )
					.then( callback )
					// retry transition on success, reset form on failure
					.then(function( success ) {
						if ( success ) {
							return controller.retryTransition( "user.index" );
						}

						setP( self, {
							lock         : false,
							tokenBtnClass: "",
							tokenBtnIcon : "fa-sign-in"
						});

						// hide the failure message on user interaction
						self.$( "input" ).focus().select().on( "blur keydown", function() {
							Ember.$( this ).off( "blur keydown" );
							set( self, "failure", false );
						});
					});
			}
		}
	});

});
