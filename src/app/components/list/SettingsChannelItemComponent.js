import Ember from "Ember";
import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/SettingsChannelItemComponent.hbs";


var get = Ember.get;
var set = Ember.set;


export default ListItemComponent.extend({
	layout,

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
