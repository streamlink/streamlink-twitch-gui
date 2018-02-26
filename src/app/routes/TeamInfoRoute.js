import { getOwner } from "@ember/application";
import Route from "@ember/routing/route";


export default Route.extend({
	model() {
		return this.modelFor( "team" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:team" ).refresh();
	}
});
