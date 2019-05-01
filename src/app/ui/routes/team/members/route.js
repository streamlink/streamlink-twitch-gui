import Route from "@ember/routing/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import preload from "utils/preload";


export default class TeamMembersRoute extends Route.extend( InfiniteScrollMixin ) {
	itemSelector = ".channel-item-component";

	async model() {
		const model = this.modelFor( "team" );

		const offset = this.offset;
		const limit = this.limit;

		const channels = model.users.slice( offset, offset + limit );
		const records = await Promise.all( channels );

		return await preload( records, "logo" );
	}
}
