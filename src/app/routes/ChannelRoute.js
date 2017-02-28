import {
	get,
	set,
	Route
} from "Ember";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	model( params ) {
		const store = get( this, "store" );
		const id = params.channel;

		// try to find a stream record if the channel is broadcasting
		return store.findRecord( "twitchStream", id, { reload: true } )
			// return the stream and embedded channel record
			.then( stream => ({
				stream,
				channel: get( stream, "channel" )
			}), () => {
				// let the stream record transition from root.loading into root.empty
				// so that it can be reloaded later on... fixes #89
				const stream = store.recordForId( "twitchStream", id );
				stream._internalModel.notFound();

				// if the channel is not online, just find and return the channel record
				return store.findRecord( "twitchChannel", id, { reload: true } )
					.then( channel => ({ channel }) );
			})
			// preload images and load the channel panels in parallel
			.then( ({ stream, channel }) => {
				const name = get( channel, "name" );

				return Promise.all([
					// preload images
					Promise.resolve({ stream, channel })
						.then( preload([
							"stream.preview.large_nocache",
							"channel.logo",
							"channel.video_banner"
						]) ),
					// panels are still referenced by channel name in the private API namespace
					store.findRecord( "twitchChannelPanel", name, { reload: true } )
						.then( panels => Promise.all(
							get( panels, "panels" )
								.filterBy( "kind", "default" )
								.sortBy( "display_order" )
								// preload all panel images
								.map( panel => Promise.resolve( panel )
									.then( preload( "image" ) )
								)
							)
						)
				])
					.then( ([ , panels ]) => ({ stream, channel, panels }) );
			});
	},

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	}
});
