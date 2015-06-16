define([
	"Ember",
	"gui/selectable",
	"gui/smoothscroll",
	"text!templates/application.html.hbs"
], function(
	Ember,
	guiSelectable,
	guiSmoothscroll,
	template
) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},

		didInsertElement: function() {
			guiSelectable();
			guiSmoothscroll();

			document.documentElement.addEventListener( "keyup", function( e ) {
				var f5    = e.keyCode === 116;
				var ctrlR = e.keyCode ===  82 && e.ctrlKey === true;
				if ( f5 || ctrlR ) {
					this.get( "controller" ).send( "refresh" );
				}
			}.bind( this ), false );
		}
	});

});
