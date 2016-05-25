define([
	"Ember",
	"components/list/ListItemComponent",
	"hbs!templates/components/list/SettingsChannelItemComponent"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	return ListItemComponent.extend({
		layout: layout,
		classNames: [ "settings-channel-item-component" ]
	});

});
