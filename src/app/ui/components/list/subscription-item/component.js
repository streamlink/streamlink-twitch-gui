import { get, getWithDefault, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { twitch as twitchConfig } from "config";
import { openBrowser } from "nwjs/Shell";
import ListItemComponent from "../-list-item/component";
import Moment from "moment";
import layout from "./template.hbs";
import "./styles.less";


const {
	subscription: {
		"edit-url": subscriptionEditUrl,
		"cancel-url": subscriptionCancelUrl
	}
} = twitchConfig;


export default ListItemComponent.extend({
	layout,

	classNames: [ "subscription-item-component" ],
	attributeBindings: [ "style" ],

	product  : alias( "content.product" ),
	channel  : alias( "product.channel" ),
	emoticons: alias( "product.emoticons" ),

	style: computed( "channel.profile_banner", "channel.video_banner", function() {
		const banner = getWithDefault( this,
			"channel.profile_banner",
			getWithDefault( this, "channel.video_banner", "" )
		);

		return ( `background-image:url("${banner}")` ).htmlSafe();
	}),

	hasEnded: computed( "content.access_end", function() {
		const access_end = get( this, "content.access_end" );

		return new Date() > access_end;
	}).volatile(),

	ends: computed( "content.access_end", function() {
		const access_end = get( this, "content.access_end" );

		return new Moment().to( access_end, true );
	}).volatile(),

	subbedFor: computed(
		"content.purchase_profile.consecutive_months",
		"channel.subscribed.created_at",
		function() {
			const months = Number( get( this, "content.purchase_profile.consecutive_months" ) );
			if ( !isNaN( months ) && months > 0 ) {
				return months;
			}
			const started = get( this, "channel.subscribed.created_at" );

			return started
				? new Moment().diff( new Moment( started ), "months" )
				: 0;
		}
	),


	openBrowser( url ) {
		const channel = get( this, "product.short_name" );

		return openBrowser( url, {
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
