define([
	"ember",
	"text!templates/featured.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		defaultTemplate: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-featured", "wrapper", "vertical" ]
	});

});
