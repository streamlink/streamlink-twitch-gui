import { get, setProperties } from "@ember/object";
import UserIndexRoute from "ui/routes/user/index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import { map, toArray } from "ui/routes/-mixins/routes/infinite-scroll/record-array";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


function filterMatches( filter, value ) {
	return filter === "all" || filter === value;
}

const contentPaths = {
	all: "controller.model.channels",
	games: "controller.model.games",
	channels: "controller.model.channels"
};

const itemSelectors = {
	all: ".channel-item-component",
	games: ".game-item-component",
	channels: ".channel-item-component"
};

const fetchMethods = {
	all: "fetchChannels",
	games: "fetchGames",
	channels: "fetchChannels"
};


export default UserIndexRoute.extend( PaginationMixin, RefreshRouteMixin, {
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
		const [ games, channels ] = await Promise.all([
			this.fetchGames( params ),
			this.fetchChannels( params )
		]);

		return { games, channels };
	},

	fetchContent() {
		const { fetchMethod, controller: { filter, query } } = this;

		return this[ fetchMethod ]({ filter, query });
	},


	/**
	 * @return {Promise<TwitchSearchGame[]>}
	 */
	async fetchGames({ filter, query }) {
		if ( !filterMatches( filter, "games" ) ) {
			return [];
		}

		const first = this.calcFetchSize( itemSelectors[ "games" ], 2 );
		const queryData = { query, first };
		if ( filter === "games" ) {
			queryData[ "first" ] = this.limit;
			if ( this.paginationMethod && this.paginationCursor ) {
				queryData[ this.paginationMethod ] = this.paginationCursor;
			}
		}

		/** @type {TwitchSearchGame[]} */
		const records = await this.store.query( "twitch-search-game", queryData );

		if ( filter === "games" ) {
			this.paginationCursor = get( records, "meta.pagination.cursor" );
		}

		return await preload( await toArray( records ), "game.box_art_url.latest" );
	},

	/**
	 * @return {Promise<TwitchSearchChannel[]>}
	 */
	async fetchChannels({ filter, query }) {
		if ( !filterMatches( filter, "channels" ) ) {
			return [];
		}

		const queryData = { query, first: this.limit };
		if ( this.paginationMethod && this.paginationCursor ) {
			queryData[ this.paginationMethod ] = this.paginationCursor;
		}

		/** @type {TwitchSearchChannel[]} */
		let records = await this.store.query( "twitch-search-channel", queryData );
		this.paginationCursor = get( records, "meta.pagination.cursor" );

		/** @type {TwitchUser[]} */
		records = await map( records, async record => {
			try {
				await record.user.promise;
				return record.user.content;
			} catch ( e ) {
				return false;
			}
		});

		return await preload( records, "profile_image_url" );
	}
});
