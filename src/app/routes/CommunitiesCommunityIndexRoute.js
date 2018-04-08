import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "./mixins/infinite-scroll/offset";
import FilterLanguagesMixin from "./mixins/filter-languages";


export default Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStream",
	modelPreload: "preview.mediumLatest",

	model() {
		const model = this.modelFor( "communitiesCommunity" );
		const community_id = get( model, "id" );

		return this._super({ community_id });
	},

	refresh() {
		return getOwner( this ).lookup( "route:communitiesCommunity" ).refresh();
	}
});
