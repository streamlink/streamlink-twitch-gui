import { get } from "@ember/object";
import Route from "@ember/routing/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


const reNum = /^\d+$/;


export default Route.extend( RefreshRouteMixin, {
	async model( params ) {
		const store = get( this, "store" );
		let { channel: id } = params;
		let stream;
		let channel;

		if ( !reNum.test( id ) ) {
			const user = await store.findRecord( "twitchUser", id );
			try {
				stream = await get( user, "stream" );
			} catch ( e ) {}
			channel = await get( user, "channel" );

		} else {
			try {
				stream = await store.findRecord( "twitchStream", id, { reload: true } );
				channel = get( stream, "channel" );
			} catch ( e ) {
				// if the channel is not online, just find and return the channel record
				channel = await store.findRecord( "twitchChannel", id, { reload: true } );
			}
		}

		const model = { stream, channel };
		await preload( model, [
			"stream.preview.largeLatest",
			"channel.logo",
			"channel.video_banner"
		]);

		return model;
	}
});
