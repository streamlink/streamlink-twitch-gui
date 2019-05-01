import { set } from "@ember/object";
import Route from "@ember/routing/route";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default class FeaturedRoute extends Route.extend( RefreshRouteMixin ) {
	async model() {
		const store = this.store;

		const [ summary, featured ] = await Promise.all([
			store.queryRecord( "twitch-stream-summary", {} ),
			store.query( "twitch-stream-featured", {
				offset: 0,
				limit : 5
			})
		]);
		await preload( featured, [
			"stream.preview.largeLatest"
		]);

		return { summary, featured };
	}

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	}
}
