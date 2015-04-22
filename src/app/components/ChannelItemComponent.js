define([
	"ember",
	"views/PreviewImageViewMixin",
	"text!templates/components/channel.html.hbs"
], function( Ember, PreviewImage, template ) {

	return Ember.Component.extend( PreviewImage, {
		layout: Ember.HTMLBars.compile( template ),
		tagName: "li",
		classNames: [ "channel-component" ]
	});

});
