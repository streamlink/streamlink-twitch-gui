define([
	"Ember",
	"text!templates/components/settingsbar.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;
	var set = Ember.set;
	var equal = Ember.computed.equal;
	var not = Ember.computed.not;

	return Ember.Component.extend({
		settings: Ember.inject.service(),

		layout: Ember.HTMLBars.compile( template ),
		tagName: "div",
		classNameBindings: [ ":settingsbar", "isOpened:opened" ],

		isOpened: false,

		btnHomepage: false,
		btnLayout: false,


		url: function() {
			return get( this, "targetObject.target.location" ).getURL();
		}.property( "targetObject.target.location" ).volatile(),

		isHomepage: function() {
			return get( this, "url" ) === get( this, "settings.gui_homepage" );
		}.property( "url", "settings.gui_homepage" ),

		isLayoutTile: equal( "settings.gui_layout", "tile" ),
		isLayoutList: not( "isLayoutTile" ),


		saveSettings: function( prop, value, callback ) {
			var settings = get( this, "settings" );
			var record = get( settings, "content" );
			set( settings, prop, value );
			record.save().then( callback );
		},


		actions: {
			toggle: function() {
				this.toggleProperty( "isOpened" );
			},

			homepage: function( value, callback ) {
				this.saveSettings( "gui_homepage", value, callback );
			},

			layout: function( value, callback ) {
				this.saveSettings( "gui_layout", value, callback );
			}
		}
	});

});
