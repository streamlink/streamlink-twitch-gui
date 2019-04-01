import UserIndexRoute from "../index/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, {
	itemSelector: ".subscription-item-component",
	modelName: "twitchTicket",

	async model() {
		// request the subscriptions by offset
		let tickets = await this._super({ unended: true });

		// filter out unwanted ticket types (eg. twitch turbo)
		tickets = this.filterFetchedContent( tickets, "product.ticket_type", "chansub" );

		// load all channel references asynchronously (get the EmberData.PromiseObject)
		await Promise.all( tickets.map( ticket => ticket.loadChannel() ) );
		// and filter out rejected promises (banned channels, etc.)
		tickets = this.filterFetchedContent( tickets, "channel.isFulfilled", true );

		// get a list of emoticons of all fetched subscriptions
		const emoticons = tickets
			.map( ticket => ticket.product.emoticons )
			.filter( emoticon => emoticon.isActive )
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
