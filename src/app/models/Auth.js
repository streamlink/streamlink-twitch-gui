define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		access_token: DS.attr( "string" ),
		scope: DS.attr( "string" ),
		date: DS.attr( "date" ),


		// volatile property
		user_name: null,

		// status properties
		isPending: false,
		isLoggedIn: function() {
			var	token	= this.get( "access_token" ),
				name	= this.get( "user_name" ),
				pending	= this.get( "isPending" );

			return token && name && !pending;
		}.property( "access_token", "user_name" ),


		// methods

		sessionPrepare: function( token, scope ) {
			this.setProperties({
				access_token: token,
				scope: scope,
				date: new Date()
			});
		},

		sessionValidate: function( twitchTokenRecord ) {
			var	valid	= twitchTokenRecord.get( "valid" ),
				name	= twitchTokenRecord.get( "user_name" );

			if ( valid !== true || !name || !name.length ) {
				throw new Error( "Invalid access token" );
			}

			// token is valid and will be stored!
			return this.save()
				.then(function() {
					// all good! set the user name now so we're fully logged in
					this.set( "user_name", name );
				}.bind( this ) );
		},

		sessionReset: function() {
			// reset all values and save record
			this.setProperties({
				access_token: null,
				scope: null,
				date: null,
				user_name: null
			});
			return this.save();
		}

	}).reopenClass({
		toString: function() { return "Auth"; }
	});

});
