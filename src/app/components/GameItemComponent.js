define([
	"ember",
	"views/PreviewImageViewMixin",
	"text!templates/components/game.html.hbs"
], function( Ember, PreviewImage, Template ) {

	return Ember.Component.extend( PreviewImage, {
		layout: Ember.Handlebars.compile( Template ),
		tagName: "li",
		classNames: [ "game-component" ],

		action: "goto",

		hasStats: Ember.computed.any( "channels", "viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", this.get( "game.name" ) );
		}
	});

});
