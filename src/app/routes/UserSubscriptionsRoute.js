import {
	get,
	set
} from "Ember";
import UserIndexRoute from "routes/UserIndexRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
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
							.catch( () => false )
					)
				)
					.then( () => tickets )
					.then( this.filterFetchedContent( "product.partner_login.isFulfilled", true ) )
			)
			// also load the UserSubscription record (needed for subscription date)
			// unfortunately, this can't be loaded in parallel (channel needs to be loaded first)
			.then( tickets =>
				Promise.all( tickets
					.map( ticket => get( ticket, "product.partner_login" ) )
					.map( channel =>
						store.findExistingRecord( "twitchUserSubscription", get( channel, "id" ) )
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

				let preloadChannelPromise = Promise.resolve( tickets ).then( preload([
					"product.partner_login.logo",
					"product.partner_login.profile_banner",
					"product.partner_login.video_banner"
				]) );
				let preloadEmoticonsPromise = Promise.resolve( emoticons ).then( preload(
					"url"
				) );

				return Promise.all([
					preloadChannelPromise,
					preloadEmoticonsPromise
				])
					.then( () => tickets );
			});
	}
});
