define([
	"Ember",
	"hbs!templates/components/checkbox.html"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		defaultLayout: layout,
		tagName: "label"
	});

});
