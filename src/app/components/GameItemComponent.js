define([
	"ember",
	"mixins/PreviewImageViewMixin",
	"text!templates/components/game.html.hbs"
], function( Ember, PreviewImageViewMixin, template ) {

	return Ember.Component.extend( PreviewImageViewMixin, {
		layout: Ember.HTMLBars.compile( template ),
		tagName: "li",
		classNames: [ "game-component" ],

		action: "goto",

		hasStats: Ember.computed.any( "channels", "viewers" ),

		click: function() {
			this.sendAction( "action", "games.game", this.get( "game.name" ) );
		}
	});

});
