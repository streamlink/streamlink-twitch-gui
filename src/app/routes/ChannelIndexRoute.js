import {
	getOwner,
	Route
} from "Ember";


export default Route.extend({
	model() {
		return this.modelFor( "channel" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
});
