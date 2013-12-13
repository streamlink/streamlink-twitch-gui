define([
	"ember",
	"text!templates/loading.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "section",
		classNames: [ "loading" ]
	});

});
