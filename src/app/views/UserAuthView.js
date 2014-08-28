define([
	"ember",
	"text!templates/user/auth.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-user content-user-auth" ]
	});

});
