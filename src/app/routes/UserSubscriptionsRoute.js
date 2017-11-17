import {
	get,
	set
} from "ember";
import UserIndexRoute from "./UserIndexRoute";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, {
	itemSelector: ".subscription-item-component",

	model() {
		const store = get( this, "store" );

		return store.query( "twitchTicket", {
			offset : get( this, "offset" ),
			limit  : get( this, "limit" ),
			unended: true
		})
			.then( toArray() )
			// filter out unwanted ticket types (eg. twitch turbo)
			.then( this.filterFetchedContent( "product.ticket_type", "chansub" ) )
			// load all channel references asynchronously (get the EmberData.PromiseObject)
			// and filter out rejected promises (banned channels, etc.)
			.then( tickets =>
				Promise.all( tickets
					.map( ticket =>
						get( ticket, "product.partner_login" )
							.then( user => get( user, "channel" ) )
							.catch( () => false )
					)
				)
					.then( () => tickets )
					.then( this.filterFetchedContent( "product.channel.isFulfilled", true ) )
			)
			// also load the TwitchSubscription record (needed for subscription date)
			// unfortunately, this can't be loaded in parallel (channel needs to be loaded first)
			.then( tickets =>
				Promise.all( tickets
					.map( ticket => get( ticket, "product.partner_login.channel" ) )
					.map( channel =>
						store.findExistingRecord( "twitchSubscription", get( channel, "id" ) )
							.catch( () => false )
							.then( record => set( channel, "subscribed", record ) )
					)
				)
					.then( () => tickets )
			)
			.then( tickets => {
				let emoticons = tickets
					.map( ticket => get( ticket, "product.emoticons" ) )
					.reduce( ( res, item ) => {
						res.push( ...item.toArray() );
						return res;
					}, [] );

				const preloadChannelPromise = preload( tickets, [
					"product.channel.logo",
					"product.channel.profile_banner",
					"product.channel.video_banner"
				]);
				const preloadEmoticonsPromise = preload( emoticons, "url" );

				return Promise.all([
					preloadChannelPromise,
					preloadEmoticonsPromise
				])
					.then( () => tickets );
			});
	}
});
