define([
	"ember",
	"text!templates/components/checkbox.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		defaultLayout: Ember.HTMLBars.compile( template ),
		tagName: "label"
	});

});
