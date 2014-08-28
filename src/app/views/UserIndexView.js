define([
	"ember",
	"text!templates/user/index.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-index" ]
	});

});
