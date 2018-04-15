import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import Route from "@ember/routing/route";


export default Route.extend({
	async model() {
		const model = this.modelFor( "communitiesCommunity" );
		await get( model, "owner" );

		return model;
	},

	refresh() {
		return getOwner( this ).lookup( "route:communitiesCommunity" ).refresh();
	}
});
