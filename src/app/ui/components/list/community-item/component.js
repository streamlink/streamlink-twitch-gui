import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	routing: service( "-routing" ),

	layout,

	classNames: [ "community-item-component" ],

	click() {
		let community = get( this, "content.id" );
		get( this, "routing" ).transitionTo( "communities.community", community );
	}
});
