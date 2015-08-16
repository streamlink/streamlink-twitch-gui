define([
	"Ember",
	"text!templates/user/subscriptions.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-subscriptions" ]
	});

});
