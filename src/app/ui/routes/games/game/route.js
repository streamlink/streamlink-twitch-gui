import { set } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default class GamesGamesRoute
extends Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, RefreshRouteMixin ) {
	itemSelector = ".stream-item-component";
	modelName = "twitch-stream";
	modelPreload = "preview.mediumLatest";

	async model({ game }) {
		const model = await super.model({ game });

		return { game, model };
	}

	async fetchContent() {
		const game = this.controller.game;
		const { model } = await this.model({ game });

		return model;
	}

	setupController( controller, { game, model }, ...args ) {
		super.setupController( controller, model, ...args );
		set( controller, "game", game );
	}
}
