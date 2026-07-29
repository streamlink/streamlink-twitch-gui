import { get, set } from "@ember/object";
import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


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
