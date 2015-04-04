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


		isAdvanced: Ember.computed.readOnly( "model.advanced" ),

		isHttp: Ember.computed.equal( "model.player_passthrough", "http" ),

		hasTaskBarIntegration: Ember.computed.equal( "model.gui_integration", 1 ),
		hasBothIntegrations: Ember.computed.equal( "model.gui_integration", 3 ),
		isVisibleInTaskbar: Ember.computed.or( "hasTaskBarIntegration", "hasBothIntegrations" ),

		notifyGroupAndClick: Ember.computed.and( "model.notify_grouping", "model.notify_click" ),
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
			apply: function( successCallback ) {
				// copy all attributes back to the original settings record
				this.settings.setProperties( get( this, "model" ) );
				// and then save
				this.settings.save()
					.then(function() {
						if ( successCallback ) {
							successCallback( this.retryTransition.bind( this ) );
						} else {
							this.retryTransition();
						}
					}.bind( this ) )
					.catch( this.settings.rollback.bind( this.settings ) );
			},

			discard: function( successCallback ) {
				var attributes = this.settings.constructor.readAttributes( this.settings );
				get( this, "model" ).setProperties( attributes );
				if ( successCallback ) {
					successCallback( this.retryTransition.bind( this ) );
				} else {
					Ember.run.next( this, this.retryTransition );
				}
			}
		}
	});

});
