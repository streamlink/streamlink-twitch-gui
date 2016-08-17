define([
	"Ember",
	"templates/components/stream/StreamPresentationComponent.hbs"
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
