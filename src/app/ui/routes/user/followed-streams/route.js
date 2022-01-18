import UserIndexRoute from "ui/routes/user/index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( PaginationMixin, RefreshRouteMixin, {
	modelName: "twitch-stream-followed",
	modelMapBy: "stream",
	modelPreload: "thumbnail_url.latest",
	itemSelector: ".stream-item-component",

	/**
	 * @param {TwitchStream} twitchStream
	 * @return {Promise}
	 */
	async modelItemLoader( twitchStream ) {
		await Promise.all([
			twitchStream.user.promise,
			twitchStream.channel.promise
		]);
	},

	query() {
		const query = this._super();
		const { user_id } = this.auth.session;

		return Object.assign( query, { user_id } );
	}
});
