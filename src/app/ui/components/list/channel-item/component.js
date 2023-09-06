import ListItemComponent from "../-list-item/component";
import { alias } from "@ember/object/computed";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	layout,

	classNames: [ "channel-item-component" ],

	user: alias( "content.broadcaster_id" )
});
