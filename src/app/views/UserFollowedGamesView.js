define([
	"Ember",
	"text!templates/user/followedgames.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-followed-games" ]
	});

});
