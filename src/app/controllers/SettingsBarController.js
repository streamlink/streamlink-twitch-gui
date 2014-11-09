define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;

	function computed_prop( key ) {
		return function( _, value ) {
			var settings = get( this, "settings" );
			if ( arguments.length < 2 ) {
				return get( settings, key );
			} else {
				set( settings, key, value );
				settings.save();
				return value;
			}
		}.property( "settings", "settings.[]" );
	}


	return Ember.Controller.extend({
		settings: {},

		homepage: computed_prop( "gui_homepage" ),
		layout: computed_prop( "gui_layout" ),


		init: function() {
			this.store.find( "settings", 1 ).then(function( record ) {
				set( this, "settings", record );
			}.bind( this ) );
		},

		actions: {
			homepage: function( url ) {
				set( this, "homepage", url );
			},
			layout: function( mode ) {
				set( this, "layout", mode );
			}
		}
	});

});
