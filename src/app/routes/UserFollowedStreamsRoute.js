import { get } from "Ember";
import UserIndexRoute from "routes/UserIndexRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStreamFollowed",

	model() {
		return get( this, "store" ).query( this.modelName, {
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( mapBy( "stream" ) )
			.then( preload( "preview.mediumLatest" ) );
	}
});
