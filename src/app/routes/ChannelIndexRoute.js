import Ember from "Ember";


var getOwner = Ember.getOwner;


export default Ember.Route.extend({
	model: function() {
		return this.modelFor( "channel" );
	},

	refresh: function() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
});
