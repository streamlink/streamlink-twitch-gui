define([
	"ember",
	"components/ListItemComponent",
	"text!templates/components/stream.html.hbs"
], function( Ember, ListItemComponent, template ) {

	var get = Ember.get;

	return ListItemComponent.extend({
		layout: Ember.HTMLBars.compile( template ),
		classNameBindings: [ ":stream-component", "_showGame:show-game" ],

		action: "openLivestreamer",

		channel: Ember.computed.alias( "content.channel" ),

		showGame: false,
		_showGame: Ember.computed.and( "showGame", "channel.game" ),

		actions: {
			"startStream": function() {
				this.sendAction( "action", get( this, "content" ) );
			}
		}
	});

});
