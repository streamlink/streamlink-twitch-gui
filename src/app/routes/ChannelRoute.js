import {
	get,
	Route
} from "ember";
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
			.then( preload([
				"stream.preview.largeLatest",
				"channel.logo",
				"channel.video_banner"
			]) );
	}
});
