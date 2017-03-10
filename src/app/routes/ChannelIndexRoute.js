import {
	get,
	getOwner,
	Route
} from "Ember";
import preload from "utils/preload";


export default Route.extend({
	model() {
		const store = get( this, "store" );
		const { stream, channel } = this.modelFor( "channel" );

		// panels are still referenced by channel name in the private API namespace
		return store.query( "twitchChannelPanel", { channel: get( channel, "name" ) } )
			.then( panels => Promise.all( panels
				.filterBy( "kind", "default" )
				.sortBy( "display_order" )
				// preload all panel images
				.map( panel => Promise.resolve( panel )
					.then( preload( "image" ) )
				)
			) )
			.then( panels => ({ stream, channel, panels }) );
	},

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
});
