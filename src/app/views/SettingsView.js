define([
	"ember",
	"text!templates/settings.html.hbs",
	"gui/fileselect"
], function( Ember, Template, guiFileselect ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-settings" ],

		didInsertElement: function() {
			guiFileselect( this.$() );
		}
	});

});
