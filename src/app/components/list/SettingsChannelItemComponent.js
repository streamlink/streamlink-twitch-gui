define([
	"Ember",
	"components/list/ListItemComponent",
	"templates/components/list/SettingsChannelItemComponent.hbs"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;


	return ListItemComponent.extend({
		layout: layout,
		classNames: [ "settings-channel-item-component" ],

		dialog: false,

		actions: {
			"eraseDialog": function() {
				set( this, "dialog", true );
			},

			"confirm": function() {
				get( this, "erase" )();
			},

			"decline": function() {
				set( this, "dialog", false );
			}
		}
	});

});
