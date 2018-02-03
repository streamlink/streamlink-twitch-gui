import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import Route from "@ember/routing/route";


export default Route.extend({
	model() {
		const model = this.modelFor( "communitiesCommunity" );

		return get( model, "owner" )
			.then( () => model );
	},

	refresh() {
		return getOwner( this ).lookup( "route:communitiesCommunity" ).refresh();
	}
});
