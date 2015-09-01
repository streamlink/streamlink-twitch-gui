define([
	"Ember",
	"text!templates/channel/index.html.hbs"
], function(
	Ember,
	template
) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "section",
		classNames: [ "content", "content-index" ]
	});

});
