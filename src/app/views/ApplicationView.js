define([
	"ember",
	"text!templates/application.html.hbs",
	"gui/selectable",
	"gui/smoothscroll"
], function( Ember, Template, guiSelectable, guiSmoothscroll ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},

		didInsertElement: function() {
			this._super();
			guiSelectable();
			guiSmoothscroll();
		}
	});

});
