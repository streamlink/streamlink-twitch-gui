import UserIndexRoute from "ui/routes/user/index/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, {
	itemSelector: ".channel-item-component",

	async model() {
		const { /** @type {DS.Store} */ store, offset, limit } = this;
		/** @type {TwitchTeam} */
		const model = this.modelFor( "team" );
		const { users: user_ids } = model;

		const options = { reload: true };
		/** @type {TwitchUser[]} */
		const twitchUsers = await Promise.all( user_ids
			.slice( offset, offset + limit )
			.map( async user_id => {
				try {
					const [ user ] = await Promise.all([
						store.findRecord( "twitch-user", user_id, options ),
						store.findRecord( "twitch-channel", user_id, options )
					]);
					return user;
				} catch ( e ) {
					return false;
				}
			} )
			.filter( Boolean )
		);

		// load TwitchStream relationships after loading TwitchUser records (coalesced queries)
		await Promise.all(
			twitchUsers.map( twitchUser =>
				twitchUser.stream.promise.catch( () => null )
			)
		);

		return await preload( twitchUsers, "" );
	}
});
