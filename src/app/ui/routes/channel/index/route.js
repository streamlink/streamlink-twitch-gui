import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import Route from "@ember/routing/route";
import preload from "utils/preload";


export default Route.extend({
	async model() {
		const store = get( this, "store" );
		const { stream, channel } = this.modelFor( "channel" );
		const name = get( channel, "name" );

		// panels are still referenced by channel name in the private API namespace
		const records = await store.query( "twitchChannelPanel", { channel: name } );
		const panels = await Promise.all( records
			.filterBy( "kind", "default" )
			.sortBy( "display_order" )
			// preload all panel images
			.map( panel => preload( panel, "image" ) )
		);

		return { stream, channel, panels };
	},

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
});
