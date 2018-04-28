import { get, setProperties } from "@ember/object";
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


export default Route.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	queryParams: {
		filter: {
			refreshModel: true,
			replace: false
		},
		query: {
			refreshModel: true,
			replace: false
		}
	},


	beforeModel() {
		const { filter } = this.paramsFor( "search" );
		// update these properties before the model gets loaded to ensure that
		// infinite scrolling is working when changing the filter
		setProperties( this, {
			contentPath: contentPaths[ filter ],
			itemSelector: itemSelectors[ filter ],
			fetchMethod: fetchMethods[ filter ]
		});

		return this._super( ...arguments );
	},

	async model( params ) {
		const [ games, channels, streams ] = await Promise.all([
			this.fetchGames( params ),
			this.fetchChannels( params ),
			this.fetchStreams( params )
		]);

		return { games, channels, streams };
	},

	fetchContent() {
		const fetchMethod = get( this, "fetchMethod" );
		const filter = get( this, "controller.filter" );
		const query = get( this, "controller.query" );

		return this[ fetchMethod ]({ filter, query });
	},


	async fetchGames({ filter, query }) {
		if ( !filterMatches( filter, "games" ) ) {
			return [];
		}

		const store = get( this, "store" );
		const records = await store.query( "twitchSearchGame", {
			type: "suggest",
			live: true,
			query
		});

		return await preload( toArray( records ), "game.box.largeLatest" );
	},

	async fetchChannels({ filter, query }) {
		if ( !filterMatches( filter, "channels" ) ) {
			return [];
		}

		const store = get( this, "store" );
		const records = await store.query( "twitchSearchChannel", {
			offset: get( this, "offset" ),
			limit: get( this, "limit" ),
			query
		});

		return await preload( mapBy( records, "channel" ), "logo" );
	},

	async fetchStreams({ filter, query }) {
		if ( !filterMatches( filter, "streams" ) ) {
			return [];
		}

		const store = get( this, "store" );
		const records = await store.query( "twitchSearchStream", {
			offset: get( this, "offset" ),
			limit: get( this, "limit" ),
			query
		});

		return await preload( mapBy( records, "stream" ), "preview.mediumLatest" );
	}
});
