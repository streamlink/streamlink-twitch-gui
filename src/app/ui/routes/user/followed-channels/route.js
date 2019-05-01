import UserIndexRoute from "../index/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default class UserFollowedChannelsRoute
extends UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin ) {
	itemSelector = ".channel-item-component";
	modelName = "twitch-channel-followed";
	modelMapBy = "channel";
	modelPreload = "logo";

	queryParams = {
		sortby: {
			refreshModel: true
		},
		direction: {
			refreshModel: true
		}
	};


	model({ sortby = "created_at", direction = "desc" }) {
		return super.model({ sortby, direction });
	}

	fetchContent() {
		const { sortby, direction } = this.controller;

		return this.model({ sortby, direction });
	}
}
