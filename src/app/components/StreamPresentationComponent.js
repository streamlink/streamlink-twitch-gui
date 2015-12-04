define([
	"Ember",
	"hbs!templates/components/StreamPresentationComponent"
], function(
	Ember,
	layout
) {

	var get = Ember.get;

	return Ember.Component.extend({
		layout: layout,

		tagName: "section",
		classNameBindings: [ ":stream-presentation-component", "class" ],
		"class": "",

		clickablePreview: true,
		action: "openLivestreamer",

		actions: {
			"previewClick": function( stream ) {
				if ( !get( this, "clickablePreview" ) ) { return; }
				this.sendAction( "action", stream );
			}
		}
	});

});
