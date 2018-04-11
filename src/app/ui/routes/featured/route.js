import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	async model() {
		const store = get( this, "store" );

		const [ summary, featured ] = await Promise.all([
			store.queryRecord( "twitchStreamSummary", {} ),
			store.query( "twitchStreamFeatured", {
				offset: 0,
				limit : 5
			})
		]);
		await preload( featured, [
			"image",
			"stream.preview.largeLatest"
		]);

		return { summary, featured };
	},

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	}
});
