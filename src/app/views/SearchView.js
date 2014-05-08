define([
	"ember",
	"text!templates/search.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-search" ]
	});

});
