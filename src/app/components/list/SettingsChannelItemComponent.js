import {
	get,
	set
} from "ember";
import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/SettingsChannelItemComponent.hbs";


export default ListItemComponent.extend({
	layout,

	classNames: [ "settings-channel-item-component" ],

	dialog: false,

	actions: {
		eraseDialog() {
			set( this, "dialog", true );
		},

		confirm() {
			get( this, "erase" )();
		},

		decline() {
			set( this, "dialog", false );
		}
	}
});
