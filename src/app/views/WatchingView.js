define([
	"ember",
	"text!templates/watching.html.hbs"
], function( Ember, WatchingTemplate ) {

	return Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile( WatchingTemplate ),
		tagName: "main",
		classNames: [ "content", "content-watching" ]
	});

});
