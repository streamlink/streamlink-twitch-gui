import { getOwner } from "@ember/application";
import Route from "@ember/routing/route";
import InfiniteScrollCursorMixin from "./mixins/infinite-scroll/cursor";
import RefreshRouteMixin from "./mixins/refresh";


export default Route.extend( InfiniteScrollCursorMixin, RefreshRouteMixin, {
	itemSelector: ".community-item-component",
	modelName: "twitchCommunityTop",
	modelPreload: "avatar_image_url",

	featured: true,

	model() {
		return this._super({ featured: this.featured });
	},

	refresh() {
		return getOwner( this ).lookup( "route:communitiesIndex" ).refresh();
	}
});
