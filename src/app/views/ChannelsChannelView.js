define([
	"ember",
	"views/PreviewImageViewMixin",
	"views/ChannelViewMixin",
	"text!templates/channels/channel.html.hbs"
], function( Ember, PreviewImageViewMixin, ChannelViewMixin, Template ) {

	return Ember.View.extend( PreviewImageViewMixin, ChannelViewMixin, {
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-channel" ]
	});

});
