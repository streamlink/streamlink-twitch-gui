define([
	"Ember",
	"hbs!templates/components/StatsRowComponent"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,
		tagName: "div",
		classNameBindings: [ ":stats-row-component", "class" ],

		withFlag: true
	});

});
