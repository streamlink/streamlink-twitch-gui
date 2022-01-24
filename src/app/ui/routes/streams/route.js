import UserIndexRoute from "ui/routes/user/index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( PaginationMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitch-stream",
	modelPreload: "thumbnail_url.latest",

	/**
	 * @param {TwitchStream} twitchStream
	 * @return {Promise}
	 */
	async modelItemLoader( twitchStream ) {
		await Promise.all([
			twitchStream.user.promise,
			twitchStream.channel.promise
		]);
	}
});
