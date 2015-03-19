define([
	"ember",
	"text!templates/user/auth.html.hbs"
], function( Ember, template ) {

	var get = Ember.get,
	    set = Ember.setProperties;

	function wait( time ) {
		return function( data ) {
			var defer = Promise.defer();
			setTimeout(function() {
				defer.resolve( data );
			}, time );
			return defer.promise;
		};
	}

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-auth" ],

		showTokenForm: false,
		authWinObserver: function() {
			if ( get( this, "showTokenForm" ) && get( this, "controller.auth_win_lock" ) ) {
				set( this, {
					showTokenForm: false
				});
			}
		}.observes( "controller.auth_win_lock" ),

		auth_scope: function() {
			return get( this, "controller.auth_scope" ).join( ", " );
		}.property( "controller.auth_scope" ),

		token: "",

		tokenBtnClass: "",
		tokenBtnIcon: "fa-sign-in",

		actions: {
			"showTokenForm": function() {
				set( this, {
					showTokenForm: true
				});
				set( this.controller, {
					auth_failure: false
				});
				Ember.run.next( this, function() {
					this.$( "input" ).focus();
				});
			},

			"inputAction": function() {
				this.$( "input + .input-group-btn > button" ).click();
			},

			"signinToken": function( callback ) {
				var self = this;
				var controller = get( self, "controller" );

				if ( get( controller, "auth_lock" ) || get( controller, "auth_win_lock" ) ) {
					return;
				}

				set( controller, {
					auth_lock: true,
					auth_failure: false
				});

				set( self, {
					tokenBtnClass: "btn-info",
					tokenBtnIcon: "fa-refresh fa-spin"
				});

				var token = get( self, "token" );

				Promise.resolve()
					.then( wait( 1000 ) )
					.then( controller.login.bind( controller, token, false ) )
					.then(function() {
						set( self, {
							tokenBtnClass: "btn-success",
							tokenBtnIcon: "fa-check"
						});
						return true;
					}, function() {
						set( controller, {
							auth_failure: true
						});
						set( self, {
							tokenBtnClass: "btn-danger",
							tokenBtnIcon: "fa-times"
						});
						return false;
					})
					.then( wait( 1000 ) )
					.then(function( success ) {
						callback(function() {
							set( controller, {
								auth_lock: false
							});

							if ( success ) {
								return controller.returnToPreviousRoute();
							}

							set( self, {
								tokenBtnClass: "",
								tokenBtnIcon: "fa-sign-in"
							});

							self.$( "input" ).focus().select().on( "blur keydown", function() {
								Ember.$( this ).off( "blur keydown" );
								set( controller, {
									auth_failure: false
								});
							});
						});
					});
			}
		}
	});

});
