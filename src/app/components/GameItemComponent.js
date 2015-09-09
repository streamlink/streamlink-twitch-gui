define([
	"Ember",
	"components/ListItemComponent",
	"text!templates/components/game.html.hbs"
], function( Ember, ListItemComponent, template ) {

	var get = Ember.get;
	var or = Ember.computed.or;

	return ListItemComponent.extend({
		layout: Ember.HTMLBars.compile( template ),
		classNames: [ "game-component" ],

		action: "goto",

		game: or( "content.game", "content" ),
		hasStats: or( "content.channels", "content.viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", get( this, "game.name" ) );
		}
	});

});
