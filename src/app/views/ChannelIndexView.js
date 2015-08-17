define([
	"Ember",
	"mixins/ChannelViewMixin",
	"text!templates/channel/index.html.hbs"
], function(
	Ember,
	ChannelViewMixin,
	template
) {

	return Ember.View.extend( ChannelViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "section",
		classNames: [ "content", "content-index" ]
	});

});
