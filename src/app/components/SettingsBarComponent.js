define([
	"Ember",
	"text!templates/components/settingsbar.html.hbs"
], function( Ember, template ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "div",
		classNameBindings: [ ":settingsbar", "isOpened:opened" ],

		settingsBinding: "targetObject.settings",

		isOpened: false,

		btnHomepage: false,
		btnLayout: false,


		url: function() {
			return get( this, "targetObject.target.location" ).getURL();
		}.property( "targetObject.target.location" ).volatile(),

		isHomepage: function() {
			return get( this, "url" ) === get( this, "settings.gui_homepage" );
		}.property( "url", "settings.gui_homepage" ),

		isLayoutTile: Ember.computed.equal( "settings.gui_layout", "tile" ),
		isLayoutList: Ember.computed.not( "isLayoutTile" ),


		actions: {
			toggle: function() {
				this.toggleProperty( "isOpened" );
			},

			homepage: function( url, callback ) {
				set( this, "settings.gui_homepage", url );
				get( this, "settings" ).save().then(function() {
					if ( callback ) { callback(); }
				});
			},

			layout: function( mode, callback ) {
				set( this, "settings.gui_layout", mode );
				get( this, "settings" ).save().then(function() {
					if ( callback ) { callback(); }
				});
			}
		}
	});

});
