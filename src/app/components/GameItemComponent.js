define([
	"ember",
	"components/ListItemComponent",
	"text!templates/components/game.html.hbs"
], function( Ember, ListItemComponent, template ) {

	var get = Ember.get;

	return ListItemComponent.extend({
		layout: Ember.HTMLBars.compile( template ),
		classNames: [ "game-component" ],

		action: "goto",

		game: Ember.computed.any( "content.game", "content" ),
		hasStats: Ember.computed.any( "content.channels", "content.viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", get( this, "game.name" ) );
		}
	});

});
