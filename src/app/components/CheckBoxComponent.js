define([
	"Ember",
	"hbs!templates/components/CheckBoxComponent.html"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		defaultLayout: layout,
		tagName: "label"
	});

});
