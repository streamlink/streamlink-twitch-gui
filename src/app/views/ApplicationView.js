define([
	"ember",
	"text!templates/application.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		}
	});

});
