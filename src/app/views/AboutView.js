define([
	"ember",
	"text!templates/about.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "section",
		classNames: [ "content-about" ]
	});

});
