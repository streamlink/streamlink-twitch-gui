import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	layout,

	classNames: [ "team-item-component" ]
});
