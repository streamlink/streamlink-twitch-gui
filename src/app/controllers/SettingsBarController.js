define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;

	function settings_property( key ) {
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

		homepage: settings_property( "gui_homepage" ),
		layout: settings_property( "gui_layout" ),

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
