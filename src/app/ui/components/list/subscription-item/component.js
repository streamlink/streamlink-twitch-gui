import { get, getWithDefault, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { twitch as twitchConfig } from "config";
import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


const {
	subscription: {
		"edit-url": subscriptionEditUrl,
		"cancel-url": subscriptionCancelUrl
	}
} = twitchConfig;


export default ListItemComponent.extend({
	nwjs: service(),

	layout,

	classNames: [ "subscription-item-component" ],
	attributeBindings: [ "style" ],

	channel: alias( "content.channel" ),

	style: computed( "channel.profile_banner", "channel.video_banner", function() {
		const banner = getWithDefault( this,
			"channel.profile_banner",
			getWithDefault( this, "channel.video_banner", "" )
		);

		return ( `background-image:url("${banner}")` ).htmlSafe();
	}),


	openBrowser( url ) {
		const channel = get( this, "content.product.short_name" );

		return this.nwjs.openBrowser( url, {
			channel
		});
	},


	actions: {
		edit() {
			return this.openBrowser( subscriptionEditUrl );
		},

		cancel() {
			return this.openBrowser( subscriptionCancelUrl );
		}
	}
});
