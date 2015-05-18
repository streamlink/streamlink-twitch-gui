define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		access_end: DS.attr( "date" ),
		access_start: DS.attr( "date" ),
		product: DS.belongsTo( "twitchProduct" ),
		purchase_profile: DS.attr()
	}).reopenClass({
		toString: function() { return "api/users/:user/tickets"; }
	});

});
