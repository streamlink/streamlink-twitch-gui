define([
	"ember",
	"text!templates/application.html.hbs",
	"gui/selectable",
	"gui/smoothscroll"
], function( Ember, template, guiSelectable, guiSmoothscroll ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
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
