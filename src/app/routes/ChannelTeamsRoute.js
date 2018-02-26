import { get } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, {
	itemSelector: ".team-item-component",

	modelName: "twitchTeam",

	model() {
		const store = get( this, "store" );
		const { channel } = this.modelFor( "channel" );

		return store.query( this.modelName, { channel: get( channel, "id" ) } )
			.then( records => preload( records, "logo" ) );
	}
});
