define([
	"Ember",
	"components/ListItemComponent",
	"hbs!templates/components/ChannelItemComponent.html"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	return ListItemComponent.extend({
		layout: layout,
		classNames: [ "channel-item-component" ]
	});

});
