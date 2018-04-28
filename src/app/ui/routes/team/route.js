import { get } from "@ember/object";
import Route from "@ember/routing/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	async model({ team }) {
		const store = get( this, "store" );
		const record = await store.findRecord( "twitchTeam", team, { reload: true } );

		return await preload( record, "logo" );
	}
});
