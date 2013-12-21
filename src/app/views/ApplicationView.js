define([
	"ember",
	"text!templates/application.html.hbs",
	"gui/fontsize",
	"gui/selectable",
	"gui/smoothscroll",
	"gui/scrollborders",
	"gui/selecter"
], function( Ember, Template, GUIFontsize, GUISelectable, GUISmoothscroll, GUIScrollborders, GUISelecter ) {

	Ember.Select.reopen({
		didInsertElement: function() {
			this._super();
			GUISelecter( this.$() );
		}
	});

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "body",

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},
		didInsertElement: function() {
			GUIFontsize();
			GUISelectable();
			GUISmoothscroll();
			GUIScrollborders();

			// we're ready: show the node-webkit window
			//if ( window.nwDispatcher ) {
			//	window.nwDispatcher.requireNwGui().Window.get().show();
			//}
		}
	});

});
