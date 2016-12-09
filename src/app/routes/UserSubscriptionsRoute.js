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
		var store = get( this, "store" );

		return store.query( "twitchTicket", {
			offset : get( this, "offset" ),
			limit  : get( this, "limit" ),
			unended: true
		})
			.then( toArray() )
			.then( this.filterFetchedContent( "product.ticket_type", "chansub" ) )
			.then(function( records ) {
				// The partner_login (channel) reference is loaded asynchronously
				// just get the PromiseProxy object and wait for it to resolve
				var channelPromises = records.mapBy( "product.partner_login" );
				return Promise.all( channelPromises )
					.then(function( channels ) {
						// Also load the UserSubscription record (needed for subscription date)
						// Sadly, this can't be loaded in parallel (channel needs to be loaded)
						return Promise.all( channels.map(function( channel ) {
							var id = get( channel, "id" );
							return store.findExistingRecord( "twitchUserSubscription", id )
								.catch(function() { return false; })
								.then(function( record ) {
									set( channel, "subscribed", record );
								});
						}) );
					})
					.then(function() {
						return records;
					});
			})
			.then(function( records ) {
				var emoticons = records
					.mapBy( "product.emoticons" )
					.reduce(function( res, item ) {
						return res.concat( item.toArray() );
					}, [] );

				var preloadChannelPromise = Promise.resolve( records ).then( preload([
					"product.partner_login.logo",
					"product.partner_login.profile_banner",
					"product.partner_login.video_banner"
				]) );
				var preloadEmoticonsPromise = Promise.resolve( emoticons ).then( preload(
					"url"
				) );

				return Promise.all([
					preloadChannelPromise,
					preloadEmoticonsPromise
				])
					.then(function() {
						return records;
					});
			});
	}
});
