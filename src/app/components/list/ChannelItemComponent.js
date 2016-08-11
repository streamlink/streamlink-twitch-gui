define([
	"Ember",
	"components/list/ListItemComponent",
	"templates/components/list/ChannelItemComponent.hbs"
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
