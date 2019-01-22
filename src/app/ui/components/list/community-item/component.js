import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	/** @type {RouterService} */
	router: service(),

	layout,

	classNames: [ "community-item-component" ],

	click() {
		let community = get( this, "content.id" );
		this.router.transitionTo( "communities.community", community );
	}
});
