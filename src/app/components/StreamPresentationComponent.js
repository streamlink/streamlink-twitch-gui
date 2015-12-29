define([
	"Ember",
	"hbs!templates/components/StreamPresentationComponent"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,

		tagName: "section",
		classNameBindings: [ ":stream-presentation-component", "class" ],
		"class": "",

		clickablePreview: true
	});

});
