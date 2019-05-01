import { getOwner } from "@ember/application";
import Route from "@ember/routing/route";


export default class ChannelIndexRoute extends Route {
	async model() {
		const { stream, channel } = this.modelFor( "channel" );

		return { stream, channel };
	}

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
}
