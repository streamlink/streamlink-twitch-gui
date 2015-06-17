define([
	"Ember",
	"components/ListItemComponent",
	"text!templates/components/stream.html.hbs"
], function( Ember, ListItemComponent, template ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var and = Ember.computed.and;

	return ListItemComponent.extend({
		layout: Ember.HTMLBars.compile( template ),
		classNameBindings: [ ":stream-component", "_showGame:show-game" ],

		action: "openLivestreamer",

		channel: alias( "content.channel" ),

		showGame: false,
		_showGame: and( "showGame", "channel.game" ),

		actions: {
			"startStream": function() {
				this.sendAction( "action", get( this, "content" ) );
			}
		}
	});

});
