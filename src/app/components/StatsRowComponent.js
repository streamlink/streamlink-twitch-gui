define([
	"ember",
	"text!templates/components/statsrow.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "div",
		classNameBindings: [ ":stats-row", "class" ],

		withFlag: true
	});

});
