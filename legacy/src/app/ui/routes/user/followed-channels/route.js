import UserIndexRoute from "../index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( PaginationMixin, RefreshRouteMixin, {
	modelName: "twitch-channels-followed",
	modelPreload: "profile_image_url",
	itemSelector: ".channel-item-component",

	/**
	 * @param {TwitchChannelsFollowed} twitchChannelsFollowed
	 * @return {Promise}
	 */
	async modelItemLoader( twitchChannelsFollowed ) {
		await twitchChannelsFollowed.broadcaster_id.promise;
		const twitchUser = twitchChannelsFollowed.broadcaster_id.content;
		await Promise.all([
			twitchUser.channel.promise,
			twitchUser.stream.promise.catch( () => null )
		]);
	},

	query() {
		const query = this._super();
		const { user_id } = this.auth.session;

		return Object.assign( query, { user_id } );
	}
});
