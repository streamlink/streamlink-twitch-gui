define([
	"Ember",
	"components/list/ListItemComponent",
	"hbs!templates/components/list/ChannelItemComponent"
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
