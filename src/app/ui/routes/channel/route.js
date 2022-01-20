import UserIndexRoute from "ui/routes/user/index/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default UserIndexRoute.extend( RefreshRouteMixin, {
	async model({ user_id }) {
		const { /** @type {DS.Store} */ store } = this;
		const [
			/** @type {TwitchStream} */
			stream,
			/** @type {TwitchUser} */
			user,
			/** @type {TwitchChannel} */
			channel
		] = await Promise.all([
			store.queryRecord( "twitch-stream", { user_id } ).catch(),
			store.findRecord( "twitch-user", user_id, { reload: true } ),
			store.findRecord( "twitch-channel", user_id, { reload: true } )
		]);

		return await preload( { stream, user, channel }, [
			"stream.thumbnail_url.latest",
			"user.profile_image_url",
			"user.offline_image_url"
		]);
	}
});
