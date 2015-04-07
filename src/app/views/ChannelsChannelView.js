define([
	"ember",
	"text!templates/channels/channel.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-channel" ]
	});

});
