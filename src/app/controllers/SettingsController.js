define([
	"Ember",
	"mixins/RetryTransitionMixin"
], function( Ember, RetryTransitionMixin ) {

	var get = Ember.get;
	var set = Ember.set;
	var equal = Ember.computed.equal;

	function settingsAttrMeta( attr, prop ) {
		return function() {
			var settings = get( this, "settings" );
			return settings.constructor.metaForProperty( attr ).options[ prop ];
		}.property( "settings" );
	}

	return Ember.Controller.extend( RetryTransitionMixin, {
		hlsLiveEdgeDefault: settingsAttrMeta( "hls_live_edge", "defaultValue" ),
		hlsLiveEdgeMin    : settingsAttrMeta( "hls_live_edge", "minValue" ),
		hlsLiveEdgeMax    : settingsAttrMeta( "hls_live_edge", "maxValue" ),

		hlsSegmentThreadsDefault: settingsAttrMeta( "hls_segment_threads", "defaultValue" ),
		hlsSegmentThreadsMin    : settingsAttrMeta( "hls_segment_threads", "minValue" ),
		hlsSegmentThreadsMax    : settingsAttrMeta( "hls_segment_threads", "maxValue" ),

		hasTaskBarIntegration: equal( "model.gui_integration", 1 ),
		hasBothIntegrations  : equal( "model.gui_integration", 3 ),

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
				var model = get( this, "model" ).applyChanges( true );
				model.save()
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) )
					.then( this.retryTransition.bind( this ) )
					.catch( model.rollback.bind( model ) );
			},

			"discard": function( callback ) {
				get( this, "model" ).discardChanges();
				Promise.resolve()
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) )
					.then( this.retryTransition.bind( this ) );
			}
		}
	});

});
