define([
	"ember",
	"text!templates/channel/settings.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "section",
		classNames: [ "content", "content-settings" ]
	});

});
