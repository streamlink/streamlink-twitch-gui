import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/ChannelItemComponent.hbs";


export default ListItemComponent.extend({
	layout: layout,
	classNames: [ "channel-item-component" ]
});
