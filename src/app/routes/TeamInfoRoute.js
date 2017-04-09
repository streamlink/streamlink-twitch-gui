import {
	getOwner,
	Route
} from "ember";


export default Route.extend({
	model() {
		return this.modelFor( "team" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:team" ).refresh();
	}
});
