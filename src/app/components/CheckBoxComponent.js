define([
	"Ember",
	"hbs!templates/components/CheckBoxComponent"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		defaultLayout: layout,
		tagName: "label"
	});

});
