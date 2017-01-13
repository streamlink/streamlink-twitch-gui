import {
	get,
	getWithDefault,
	computed
} from "Ember";
import { twitch } from "config";
import { openBrowser } from "nwjs/Shell";
import ListItemComponent from "components/list/ListItemComponent";
import Moment from "Moment";
import layout from "templates/components/list/SubscriptionItemComponent.hbs";


const { alias } = computed;
const {
	subscription: {
		"edit-url": subscriptionEditUrl,
		"cancel-url": subscriptionCancelUrl
	}
} = twitch;


export default ListItemComponent.extend({
	layout,

	classNames: [ "subscription-item-component" ],
	attributeBindings: [ "style" ],

	product  : alias( "content.product" ),
	channel  : alias( "product.partner_login" ),
	emoticons: alias( "product.emoticons" ),

	style: computed( "channel.profile_banner", "channel.video_banner", function() {
		let banner = getWithDefault( this,
			"channel.profile_banner",
			getWithDefault( this, "channel.video_banner", "" )
		);

		return ( `background-image:url("${banner}")` ).htmlSafe();
	}),

	hasEnded: computed( "content.access_end", function() {
		var access_end = get( this, "content.access_end" );
		return new Date() > access_end;
	}).volatile(),

	ends: computed( "content.access_end", function() {
		var access_end = get( this, "content.access_end" );
		return new Moment().to( access_end );
	}).volatile(),


	openBrowser( url ) {
		let channel = get( this, "channel.id" );

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
