define([
	"ember",
	"text!templates/components/game.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( template ),
		tagName: "li",
		classNames: [ "game-component" ],

		action: "goto",

		hasStats: Ember.computed.any( "channels", "viewers" ),

		previewError: false,

		willInsertElement: function() {
			this._super.apply( this, arguments );

			this.$( "img" ).one( "error", Ember.set.bind( null, this, "previewError", true ) );
		},

		click: function() {
			this.sendAction( "action", "games.game", this.get( "game.name" ) );
		}
	});

});
