define([
	"Ember",
	"text!templates/games/index.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-games" ]
	});

});
