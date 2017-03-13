import {
	getOwner,
	Route
} from "Ember";


export default Route.extend({
	model() {
		return this.modelFor( "team" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:team" ).refresh();
	}
});
