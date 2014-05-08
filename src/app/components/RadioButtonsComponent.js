define([
	"ember",
	"text!templates/components/radiobuttons.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( template ),
		tagName: "div"
	});

});
