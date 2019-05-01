import Route from "@ember/routing/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default class TeamRoute extends Route.extend( RefreshRouteMixin ) {
	async model({ team }) {
		const record = await this.store.findRecord( "twitch-team", team, { reload: true } );

		return await preload( record, "logo" );
	}
}
