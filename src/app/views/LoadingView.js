define([
	"ember",
	"text!templates/loading.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content content-loading" ]
	});

});
