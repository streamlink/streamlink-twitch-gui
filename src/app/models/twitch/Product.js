define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		emoticons: DS.hasMany( "twitchProductEmoticon" ),
		features: DS.attr(),
		interval_number: DS.attr( "number" ),
		owner_name: DS.attr( "string" ),
		partner_login: DS.belongsTo( "twitchChannel", { async: true } ),
		period: DS.attr( "string" ),
		price: DS.attr( "string" ),
		recurring: DS.attr( "boolean" ),
		short_name: DS.attr( "string" ),
		ticket_type: DS.attr( "string" )
	}).reopenClass({
		toString: function() { return "twitchProduct"; }
	});

});
