define([
	"Ember",
	"hbs!templates/components/quickbar.html"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,
		tagName: "div",
		classNameBindings: [ ":quickbar", "isOpened:opened" ],

		isOpened: false,

		actions: {
			toggle: function() {
				this.toggleProperty( "isOpened" );
			}
		}
	});

});
