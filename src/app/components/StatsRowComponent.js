define([
	"Ember",
	"hbs!templates/components/statsrow.html"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,
		tagName: "div",
		classNameBindings: [ ":stats-row", "class" ],

		withFlag: true
	});

});
