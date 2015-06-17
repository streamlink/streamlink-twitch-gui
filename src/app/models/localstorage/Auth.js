define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get = Ember.get;
	var attr = DS.attr;

	return DS.Model.extend({
		access_token: attr( "string" ),
		scope       : attr( "string" ),
		date        : attr( "date" ),


		// volatile property
		user_name : null,

		// status properties
		isPending : false,
		isLoggedIn: function() {
			var token   = get( this, "access_token" );
			var name    = get( this, "user_name" );
			var pending = get( this, "isPending" );

			return token && name && !pending;
		}.property( "access_token", "user_name", "isPending" )

	}).reopenClass({
		toString: function() { return "Auth"; }
	});

});
