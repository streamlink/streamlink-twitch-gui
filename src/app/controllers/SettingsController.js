define( [ "ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Controller.extend({
		retryTransition: function() {
			var transition = get( this, "transition" );
			if ( transition ) {
				this.send( "closeModal" );
				transition.retry();
				set( this, "transition", null );
			}
		},


		isHttp: Ember.computed.equal( "model.player_passthrough", "http" ),
		notifyGroupAndClick: Ember.computed.and( "model.notify_grouping", "model.notify_click" ),
		// https://github.com/rogerwang/node-webkit/wiki/Notification#linux :(
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
			apply: function() {
				// copy all attributes back to the original settings record
				this.settings.setProperties( get( this, "model" ) );
				// and then save
				this.settings.save()
					.then( this.retryTransition.bind( this ) )
					.catch( this.settings.rollback.bind( this.settings ) );
			},

			discard: function() {
				var attributes = this.settings.constructor.readAttributes( this.settings );
				get( this, "model" ).setProperties( attributes );
				Ember.run.next( this, this.retryTransition );
			}
		}
	});

});
