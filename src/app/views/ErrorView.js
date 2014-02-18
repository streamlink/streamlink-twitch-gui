define([
	"ember",
	"text!templates/error.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-error" ]
	});

});
