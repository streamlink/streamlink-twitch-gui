define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		access_token: DS.attr( "string" ),
		scope       : DS.attr( "string" ),
		date        : DS.attr( "date" ),


		// volatile property
		user_name : null,

		// status properties
		isPending : false,
		isLoggedIn: function() {
			var token   = this.get( "access_token" ),
			    name    = this.get( "user_name" ),
			    pending = this.get( "isPending" );

			return token && name && !pending;
		}.property( "access_token", "user_name", "isPending" )

	}).reopenClass({
		toString: function() { return "Auth"; }
	});

});
