define([
	"ember",
	"text!templates/application.html.hbs",
	"gui/fontsize",
	"gui/selectable",
	"gui/smoothscroll",
	"gui/scrollborders"
], function( Ember, Template, GUIFontsize, GUISelectable, GUISmoothscroll, GUIScrollborders ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),

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
