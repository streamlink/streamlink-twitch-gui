define([
	"ember",
	"text!templates/settings.html.hbs",
	"gui/fileselect"
], function( Ember, Template, GUIFileselect ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "section",
		classNames: [ "content-settings" ],

		didInsertElement: function() {
			GUIFileselect( this.$() );
		},

		change: function() {
			this.controller.set( "hasChanged", true );
		}
	});

});
