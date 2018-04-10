import { set } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "routes/mixins/infinite-scroll/offset";
import FilterLanguagesMixin from "routes/mixins/filter-languages";
import RefreshRouteMixin from "routes/mixins/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStream",
	modelPreload: "preview.mediumLatest",

	async model({ game }) {
		const model = await this._super({ game });

		return { game, model };
	},

	async fetchContent() {
		const { model } = await this.model({});

		return model;
	},

	setupController( controller, { game, model }, ...args ) {
		this._super( controller, model, ...args );
		set( controller, "game", game );
	}
});
