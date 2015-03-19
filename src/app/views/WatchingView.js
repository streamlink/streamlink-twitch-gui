define([
	"ember",
	"text!templates/watching.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		defaultTemplate: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-watching" ]
	});

});
