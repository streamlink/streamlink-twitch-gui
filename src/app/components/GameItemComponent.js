define([
	"ember",
	"text!templates/components/game.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( template ),
		tagName: "li",
		classNames: [ "game-component" ],

		hasStats: function() {
			return	this.get( "channels" ) !== undefined
				&&	this.get( "viewers" ) !== undefined;
		}.property( "channels", "viewers" ),

		action: "goto",

		click: function() {
			this.sendAction( "action", "games.game", this.get( "game.name" ) );
		}
	});

});
