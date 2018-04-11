import { get, set } from "@ember/object";
import UserIndexRoute from "../index/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, {
	itemSelector: ".subscription-item-component",
	modelName: "twitchTicket",

	async model() {
		const store = get( this, "store" );

		// request the subscriptions by offset
		let tickets = await this._super({ unended: true });

		// filter out unwanted ticket types (eg. twitch turbo)
		tickets = this.filterFetchedContent( tickets, "product.ticket_type", "chansub" );

		// load all channel references asynchronously (get the EmberData.PromiseObject)
		await Promise.all( tickets
			.map( async ticket => {
				try {
					await get( ticket, "product.partner_login" );
					await get( ticket, "product.channel" );
				} catch ( e ) {}
			})
		);
		// and filter out rejected promises (banned channels, etc.)
		tickets = this.filterFetchedContent( tickets, "product.channel.isFulfilled", true );

		// also load the TwitchSubscription record (needed for subscription date)
		// unfortunately, this can't be loaded in parallel (channel needs to be loaded first)
		await Promise.all( tickets
			.map( async ticket => {
				let subscription;
				try {
					const id = get( ticket, "product.channel.id" );
					subscription = store.findExistingRecord( "twitchSubscription", id );
				} catch ( e ) {
					subscription = false;
				}
				set( ticket, "product.channel.subscribed", subscription );
			})
		);

		// get a list of emoticons of all fetched subscriptions
		const emoticons = tickets
			.map( ticket => get( ticket, "product.emoticons" ) )
			.reduce( ( res, item ) => {
				res.push( ...item.toArray() );
				return res;
			}, [] );

		// load subscription assets and emoticons in parallel
		await Promise.all([
			preload( tickets, [
				"product.channel.logo",
				"product.channel.profile_banner",
				"product.channel.video_banner"
			]),
			preload( emoticons, "url" )
		]);

		return tickets;
	}
});
