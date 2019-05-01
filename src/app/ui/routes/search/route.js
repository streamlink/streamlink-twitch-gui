import { setProperties } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import { toArray, mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


function filterMatches( filter, value ) {
	return filter === "all" || filter === value;
}

const contentPaths = {
	all: "controller.model.streams",
	games: "controller.model.games",
	channels: "controller.model.channels",
	streams: "controller.model.streams"
};

const itemSelectors = {
	all: ".stream-item-component",
	games: ".game-item-component",
	channels: ".channel-item-component",
	streams: ".stream-item-component"
};

const fetchMethods = {
	all: "fetchStreams",
	games: "fetchGames",
	channels: "fetchChannels",
	streams: "fetchStreams"
};


export default class SearchRoute extends Route.extend( InfiniteScrollMixin, RefreshRouteMixin ) {
	queryParams = {
		filter: {
			refreshModel: true,
			replace: false
		},
		query: {
			refreshModel: true,
			replace: false
		}
	};

	contentPath;
	itemSelector;
	fetchMethod;


	beforeModel() {
		const { filter } = this.paramsFor( "search" );
		// update these properties before the model gets loaded to ensure that
		// infinite scrolling is working when changing the filter
		setProperties( this, {
			contentPath: contentPaths[ filter ],
			itemSelector: itemSelectors[ filter ],
			fetchMethod: fetchMethods[ filter ]
		});

		return super.beforeModel( ...arguments );
	}

	async model( params ) {
		const [ games, channels, streams ] = await Promise.all([
			this.fetchGames( params ),
			this.fetchChannels( params ),
			this.fetchStreams( params )
		]);

		return { games, channels, streams };
	}

	fetchContent() {
		const fetchMethod = this.fetchMethod;
		const { filter, query } = this.controller;

		return this[ fetchMethod ]({ filter, query });
	}


	/**
	 * @param filter
	 * @param query
	 * @returns {Promise<TwitchGame[]>}
	 */
	async fetchGames({ filter, query }) {
		if ( !filterMatches( filter, "games" ) ) {
			return [];
		}

		const records = await this.store.query( "twitch-search-game", {
			type: "suggest",
			live: true,
			query
		});

		return await preload( toArray( records ), "game.box.largeLatest" );
	}

	/**
	 * @param filter
	 * @param query
	 * @returns {Promise<TwitchChannel[]>}
	 */
	async fetchChannels({ filter, query }) {
		if ( !filterMatches( filter, "channels" ) ) {
			return [];
		}

		const records = await this.store.query( "twitch-search-channel", {
			offset: this.offset,
			limit: this.limit,
			query
		});

		return await preload( mapBy( records, "channel" ), "logo" );
	}

	/**
	 * @param filter
	 * @param query
	 * @returns {Promise<TwitchStream[]>}
	 */
	async fetchStreams({ filter, query }) {
		if ( !filterMatches( filter, "streams" ) ) {
			return [];
		}

		const records = await this.store.query( "twitch-search-stream", {
			offset: this.offset,
			limit: this.limit,
			query
		});

		return await preload( mapBy( records, "stream" ), "preview.mediumLatest" );
	}
}
