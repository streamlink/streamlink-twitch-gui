define([
	"Ember",
	"components/ListItemComponent",
	"text!templates/components/game.html.hbs"
], function( Ember, ListItemComponent, template ) {

	var get = Ember.get;
	var any = Ember.computed.any;

	return ListItemComponent.extend({
		layout: Ember.HTMLBars.compile( template ),
		classNames: [ "game-component" ],

		action: "goto",

		game: any( "content.game", "content" ),
		hasStats: any( "content.channels", "content.viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", get( this, "game.name" ) );
		}
	});

});
