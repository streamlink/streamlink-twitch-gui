import {
	get,
	inject,
	on,
	Mixin
} from "ember";
import { cacheAdd } from "./cache";


const { service } = inject;


export default Mixin.create({
	store: service(),

	// will be overridden by NotificationService
	running: false,

	/**
	 * Add a newly followed channel to the notification stream cache,
	 * so it doesn't pop up a new notification on the next query
	 */
	_userHasFollowedChannel: on( "init", function() {
		const store = get( this, "store" );
		const model = store.modelFor( "twitchChannelFollowed" );
		const adapter = store.adapterFor( "twitchChannelFollowed" );

		adapter.on( "createRecord", async ( store, type, snapshot ) => {
			if ( type !== model ) { return; }
			if ( !get( this, "running" ) ) { return; }

			try {
				const { id } = snapshot;
				// is the followed channel online?
				const stream = await store.findRecord( "twitchStream", id, { reload: true } );
				// if so, add to cache
				cacheAdd( stream );
			} catch ( e ) {}
		});
	})
});
