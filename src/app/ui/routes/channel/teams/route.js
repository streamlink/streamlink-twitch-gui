import UserIndexRoute from "ui/routes/user/index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";


export default UserIndexRoute.extend( PaginationMixin, {
	itemSelector: ".team-item-component",
	modelName: "twitch-team",
	modelPreload: "thumbnail_url",

	model() {
		const { user: { id: broadcaster_id } } = this.modelFor( "channel" );

		return this._super({ broadcaster_id });
	}
});
