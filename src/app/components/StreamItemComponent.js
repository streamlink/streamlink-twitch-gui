define([
	"ember",
	"views/PreviewImageViewMixin",
	"text!templates/components/stream.html.hbs"
], function( Ember, PreviewImage, template ) {

	return Ember.Component.extend( PreviewImage, {
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
