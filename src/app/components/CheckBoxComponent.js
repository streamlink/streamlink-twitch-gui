define([
	"ember",
	"text!templates/components/checkbox.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		defaultLayout: Ember.Handlebars.compile( template ),
		tagName: "label"
	});

});
