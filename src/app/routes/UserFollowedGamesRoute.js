import { get } from "Ember";
import UserIndexRoute from "routes/UserIndexRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import {
	mapBy,
	toArray
} from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",

	queryParams: {
		all: {
			refreshModel: true
		}
	},

	modelNameLive: "twitchGameFollowedLive",
	modelNameAll: "twitchGameFollowed",

	model( params ) {
		// query parameters are strings
		const all = params.all === "true";
		const modelname = all
			? this.modelNameAll
			: this.modelNameLive;

		return get( this, "store" ).query( modelname, {
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( all
				? toArray()
				: mapBy( "game" )
			)
			.then( preload( "game.box.large" ) );
	},

	fetchContent() {
		return this.model({
			all: get( this, "controller.all" )
		});
	}
});
