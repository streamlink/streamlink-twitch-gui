define([
	"Ember",
	"components/ListItemComponent",
	"text!templates/components/channel.html.hbs"
], function( Ember, ListItemComponent, template ) {

	return ListItemComponent.extend({
		layout: Ember.HTMLBars.compile( template ),
		classNames: [ "channel-component" ]
	});

});
