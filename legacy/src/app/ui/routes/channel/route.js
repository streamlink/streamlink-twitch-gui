import { NotFoundError } from "ember-data/adapters/errors";
import UserIndexRoute from "ui/routes/user/index/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default UserIndexRoute.extend( RefreshRouteMixin, {
	async model({ user_id }) {
		let data;

		try {
			data = await (
				/\D/.test( user_id )
					? this._modelUserLogin( user_id )
					: this._modelUserId( user_id )
			);
		} catch ( e ) {
			throw new NotFoundError([{
				title: "Invalid user",
				detail: `User ID or login name: ${user_id}`
			}]);
		}

		const [
			/** @type {TwitchStream} */
			stream,
			/** @type {TwitchUser} */
			user,
			/** @type {TwitchChannel} */
			channel
		] = data;

		return await preload( { stream, user, channel }, [
			"stream.thumbnail_url.latest",
			"user.profile_image_url",
			"user.offline_image_url"
		]);
	},

	async _modelUserId( user_id ) {
		const { /** @type {DS.Store} */ store } = this;

		return Promise.all([
			store.queryRecord( "twitch-stream", { user_id } )
				.catch( new Function() ),
			store.queryRecord( "twitch-user", { id: user_id } ),
			store.queryRecord( "twitch-channel", { broadcaster_id: user_id } )
		]);
	},

	async _modelUserLogin( user_login ) {
		const { /** @type {DS.Store} */ store } = this;

		const [ stream, user ] = await Promise.all([
			store.queryRecord( "twitch-stream", { user_login } )
				.catch( new Function() ),
			store.queryRecord( "twitch-user", { login: user_login } )
		]);
		const channel = await store.queryRecord( "twitch-channel", { broadcaster_id: user.id } );

		return [ stream, user, channel ];
	}
});
