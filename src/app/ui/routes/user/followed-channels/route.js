import { getProperties } from "@ember/object";
import UserIndexRoute from "../index/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".channel-item-component",
	modelName: "twitchChannelFollowed",
	modelMapBy: "channel",
	modelPreload: "logo",

	queryParams: {
		sortby: {
			refreshModel: true
		},
		direction: {
			refreshModel: true
		}
	},


	model({ sortby = "created_at", direction = "desc" }) {
		return this._super({ sortby, direction });
	},

	fetchContent() {
		const params = getProperties( this.controller, "sortby", "direction" );

		return this.model( params );
	}
});
