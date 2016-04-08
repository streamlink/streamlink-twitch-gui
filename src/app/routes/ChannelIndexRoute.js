define([
	"Ember"
], function(
	Ember
) {

	var getOwner = Ember.getOwner;


	return Ember.Route.extend({
		model: function() {
			return this.modelFor( "channel" );
		},

		refresh: function() {
			return getOwner( this ).lookup( "route:channel" ).refresh();
		}
	});

});
