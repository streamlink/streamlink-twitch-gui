define([
	"ember",
	"mixins/PreviewImageViewMixin",
	"text!templates/components/channel.html.hbs"
], function( Ember, PreviewImageViewMixin, template ) {

	return Ember.Component.extend( PreviewImageViewMixin, {
		layout: Ember.HTMLBars.compile( template ),
		tagName: "li",
		classNames: [ "channel-component" ]
	});

});
