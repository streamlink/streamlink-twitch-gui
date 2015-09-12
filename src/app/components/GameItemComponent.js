define([
	"Ember",
	"components/ListItemComponent",
	"hbs!templates/components/game.html"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	var get = Ember.get;
	var or = Ember.computed.or;

	return ListItemComponent.extend({
		layout: layout,
		classNames: [ "game-component" ],

		action: "goto",

		game: or( "content.game", "content" ),
		hasStats: or( "content.channels", "content.viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", get( this, "game.name" ) );
		}
	});

});
