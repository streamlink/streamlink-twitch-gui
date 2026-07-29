import { set } from "@ember/object";
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
	},

	async model({ game_id }) {
		const model = await this._super({ game_id });
		const game = await this.store.findRecord( "twitch-game", game_id );

		return { game, model };
	},

	async fetchContent() {
		const { id: game_id } = this.controller.game;
		const { model } = await this.model({ game_id });

		return model;
	},

	setupController( controller, { game, model }, ...args ) {
		this._super( controller, model, ...args );
		set( controller, "game", game );
	}
});
