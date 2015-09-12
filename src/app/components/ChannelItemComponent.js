define([
	"Ember",
	"components/ListItemComponent",
	"hbs!templates/components/channel.html"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	return ListItemComponent.extend({
		layout: layout,
		classNames: [ "channel-component" ]
	});

});
