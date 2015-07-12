define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;
	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		access_end: attr( "date" ),
		access_start: attr( "date" ),
		product: belongsTo( "twitchProduct" ),
		purchase_profile: attr()
	}).reopenClass({
		toString: function() { return "api/users/:user/tickets"; }
	});

});
