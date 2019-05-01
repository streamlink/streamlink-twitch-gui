import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";


export default class ChannelTeamsRoute extends Route.extend( InfiniteScrollOffsetMixin ) {
	itemSelector = ".team-item-component";
	modelName = "twitch-team";
	modelPreload = "logo";

	model() {
		const { channel: parentModel } = this.modelFor( "channel" );
		const channel = parentModel.id;

		return super.model({ channel });
	}
}
