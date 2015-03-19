define([
	"ember",
	"views/PreviewImageViewMixin",
	"views/ChannelViewMixin",
	"text!templates/channels/channel.html.hbs"
], function( Ember, PreviewImageViewMixin, ChannelViewMixin, template ) {

	return Ember.View.extend( PreviewImageViewMixin, ChannelViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-channel" ]
	});

});
