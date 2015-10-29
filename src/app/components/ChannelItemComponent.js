define([
	"Ember",
	"components/ListItemComponent",
	"hbs!templates/components/ChannelItemComponent"
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
