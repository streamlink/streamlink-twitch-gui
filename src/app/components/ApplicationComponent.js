define([
	"Ember",
	"gui/selectable",
	"gui/smoothscroll"
], function(
	Ember,
	guiSelectable,
	guiSmoothscroll
) {

	return Ember.Component.extend({
		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},

		didInsertElement: function() {
			guiSelectable();
			guiSmoothscroll();

			var controller = this.container.lookup( "controller:application" );

			document.documentElement.addEventListener( "keyup", function( e ) {
				var f5    = e.keyCode === 116;
				var ctrlR = e.keyCode ===  82 && e.ctrlKey === true;
				if ( f5 || ctrlR ) {
					controller.send( "refresh" );
				}
			}, false );
		}
	});

});
