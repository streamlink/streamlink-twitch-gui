import {
	getOwner,
	Route
} from "Ember";


export default Route.extend({
	model: function() {
		return this.modelFor( "channel" );
	},

	refresh: function() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
});
