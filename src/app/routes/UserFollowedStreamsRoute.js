import { get } from "@ember/object";
import UserIndexRoute from "./UserIndexRoute";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import RefreshMixin from "./mixins/refresh";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStreamFollowed",

	model() {
		return get( this, "store" ).query( this.modelName, {
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( records => mapBy( records, "stream" ) )
			.then( records => preload( records, "preview.mediumLatest" ) );
	}
});
