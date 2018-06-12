import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStream",
	modelPreload: "preview.mediumLatest",

	async model({ game }) {
		const model = await this._super({ game });

		return { game, model };
	},

	async fetchContent() {
		const game = get( this.controller, "game" );
		const { model } = await this.model({ game });

		return model;
	},

	setupController( controller, { game, model }, ...args ) {
		this._super( controller, model, ...args );
		set( controller, "game", game );
	}
});
