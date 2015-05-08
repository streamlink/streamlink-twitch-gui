define([
	"ember",
	"mixins/PreviewImageViewMixin",
	"text!templates/components/stream.html.hbs"
], function( Ember, PreviewImageViewMixin, template ) {

	return Ember.Component.extend( PreviewImageViewMixin, {
		layout: Ember.HTMLBars.compile( template ),
		tagName: "li",
		classNameBindings: [ ":stream-component", "_showGame:show-game" ],

		action: "openLivestreamer",

		showGame: false,
		_showGame: Ember.computed.and( "showGame", "stream.channel.game" ),

		actions: {
			"startStream": function() {
				this.sendAction( "action", this.get( "stream" ) );
			}
		}
	});

});
