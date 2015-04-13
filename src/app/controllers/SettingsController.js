define([
	"ember",
	"controllers/RetryTransitionMixin"
], function( Ember, RetryTransitionMixin ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Controller.extend( RetryTransitionMixin, {
		hasTaskBarIntegration: Ember.computed.equal( "model.gui_integration", 1 ),
		hasBothIntegrations  : Ember.computed.equal( "model.gui_integration", 3 ),

		// https://github.com/nwjs/nw.js/wiki/Notification#linux :(
		hasNotificationClickSupport: process.platform !== "linux",

		minimize_observer: function() {
			var int    = get( this, "model.gui_integration" ),
			    min    = get( this, "model.gui_minimize" ),
			    noTask = ( int & 1 ) === 0,
			    noTray = ( int & 2 ) === 0;

			// make sure that disabled options are not selected
			if ( noTask && min === 1 ) {
				set( this, "model.gui_minimize", 2 );
			}
			if ( noTray && min === 2 ) {
				set( this, "model.gui_minimize", 1 );
			}

			// enable/disable buttons
			set( this, "settings.constructor.minimize.1.disabled", noTask );
			set( this, "settings.constructor.minimize.2.disabled", noTray );

		}.observes( "model.gui_integration" ),


		actions: {
			"apply": function( callback ) {
				this.settings.setCloneAttributes( get( this, "model" ) )
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) )
					.then( this.retryTransition.bind( this ) )
					.catch( this.settings.rollback.bind( this.settings ) );
			},

			"discard": function( callback ) {
				set( this, "model", this.settings.cloneModel() );
				Promise.resolve()
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) )
					.then( this.retryTransition.bind( this ) );
			}
		}
	});

});
