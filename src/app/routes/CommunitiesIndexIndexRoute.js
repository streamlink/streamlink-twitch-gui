import {
	get,
	set,
	getOwner,
	Route
} from "ember";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import RefreshMixin from "./mixins/refresh";
import preload from "utils/preload";
import { toArray } from "utils/ember/recordArrayMethods";


export default Route.extend( InfiniteScrollMixin, RefreshMixin, {
	itemSelector: ".community-item-component",

	featured: true,

	model() {
		const store = get( this, "store" );
		const cursor = get( this, "cursor" );
		const limit = get( this, "limit" );
		const featured = get( this, "featured" );

		return store.query( "twitchCommunityTop", { cursor, limit, featured } )
			.then( toArray() )
			.then( records => preload( records, "avatar_image_url" ) )
			.then( records => {
				const cursor = get( records, "meta.cursor" );
				set( this, "cursor", cursor );

				return records;
			});
	},

	deactivate() {
		set( this, "cursor", null );

		return this._super( ...arguments );
	},

	refresh() {
		set( this, "cursor", null );

		return getOwner( this ).lookup( "route:communitiesIndex" ).refresh();
	}
});
