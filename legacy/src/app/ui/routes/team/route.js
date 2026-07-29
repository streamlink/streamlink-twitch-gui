import UserIndexRoute from "ui/routes/user/index/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default UserIndexRoute.extend( RefreshRouteMixin, {
	async model({ team_id }) {
		/** @type {TwitchTeam} */
		const record = await this.store.findRecord( "twitch-team", team_id, { reload: true } );

		return await preload( record, "thumbnail_url" );
	}
});
