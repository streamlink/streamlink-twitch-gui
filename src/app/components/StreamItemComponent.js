define([
	"ember",
	"text!templates/components/stream.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( Template ),
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
