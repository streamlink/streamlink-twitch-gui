define([
	"ember",
	"text!templates/application.html.hbs",
	"gui/selectable",
	"gui/smoothscroll",
	"gui/selecter"
], function( Ember, Template, GUISelectable, GUISmoothscroll, GUISelecter ) {

	Ember.Select.reopen({
		didInsertElement: function() {
			this._super();
			GUISelecter( this.$() );
		}
	});

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},
		didInsertElement: function() {
			GUISelectable();
			GUISmoothscroll();
		}
	});

});
