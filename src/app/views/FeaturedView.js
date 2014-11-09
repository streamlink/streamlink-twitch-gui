define([
	"ember",
	"text!templates/featured.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-featured", "wrapper", "vertical" ]
	});

});
