define([
	"Ember",
	"components/list/ListItemComponent",
	"hbs!templates/components/list/GameItemComponent"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	var get = Ember.get;
	var or = Ember.computed.or;

	return ListItemComponent.extend({
		layout: layout,
		classNames: [ "game-item-component" ],

		action: "goto",

		game: or( "content.game", "content" ),
		hasStats: or( "content.channels", "content.viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", get( this, "game.name" ) );
		}
	});

});
