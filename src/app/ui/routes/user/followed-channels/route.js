import UserIndexRoute from "../index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( PaginationMixin, RefreshRouteMixin, {
	modelName: "twitch-user-followed",
	modelMapBy: "to",
	modelPreload: "profile_image_url",
	itemSelector: ".channel-item-component",

	/**
	 * @param {TwitchUser} twitchUser
	 * @return {Promise}
	 */
	async modelItemLoader( twitchUser ) {
		await twitchUser.channel.promise;
	},

	query() {
		const query = this._super();
		const { user_id } = this.auth.session;

		return Object.assign( query, { from_id: user_id } );
	}
});
