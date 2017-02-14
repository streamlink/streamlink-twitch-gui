import { get } from "Ember";
import UserIndexRoute from "routes/UserIndexRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",

	queryParams: {
		all: {
			refreshModel: true
		}
	},

	modelName: "twitchGamesLiveFollowed",
	modelNameAll: "twitchGamesFollowed",

	model( params ) {
		// query parameters are strings
		var modelname = params.all === "true"
			? this.modelNameAll
			: this.modelName;

		return get( this, "store" ).query( modelname, {
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( toArray() )
			.then( preload( "box.large" ) );
	},

	fetchContent() {
		return this.model({
			all: get( this, "controller.all" )
		});
	}
});
