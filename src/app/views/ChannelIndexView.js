define([
	"ember",
	"mixins/PreviewImageViewMixin",
	"mixins/ChannelViewMixin",
	"text!templates/channel/index.html.hbs"
], function(
	Ember,
	PreviewImageViewMixin,
	ChannelViewMixin,
	template
) {

	return Ember.View.extend( PreviewImageViewMixin, ChannelViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "section",
		classNames: [ "content", "content-index" ]
	});

});
