define([
	"Ember",
	"text!templates/components/settingsbar.html.hbs"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Component.extend({
		settings: Ember.inject.service(),

		layout: Ember.HTMLBars.compile( layout ),
		tagName: "div",
		classNameBindings: [ ":settingsbar", "isOpened:opened" ],

		isOpened: false,

		btnHomepage: false,


		url: function() {
			return get( this, "targetObject.target.location" ).getURL();
		}.property( "targetObject.target.location" ).volatile(),

		isHomepage: function() {
			return get( this, "url" ) === get( this, "settings.gui_homepage" );
		}.property( "url", "settings.gui_homepage" ),


		saveSettings: function( prop, value ) {
			var settings = get( this, "settings" );
			var record = get( settings, "content" );
			set( settings, prop, value );
			return record.save();
		},


		actions: {
			toggle: function() {
				this.toggleProperty( "isOpened" );
			},

			homepage: function( value, success, failure ) {
				this.saveSettings( "gui_homepage", value )
					.then( success, failure )
					.catch();
			}
		}
	});

});
