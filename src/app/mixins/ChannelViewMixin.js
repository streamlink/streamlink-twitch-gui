define( [ "ember" ], function( Ember ) {

	var get = Ember.get;
	var computed = Ember.computed;

	function following( yes, no, unknown ) {
		return computed( "isFollowing", "isFollowingL", function() {
			return get( this, "isFollowingL" )
				? unknown
				: get( this, "isFollowing" )
					? yes
					: no;
		});
	}

	return Ember.Mixin.create({
		channel     : computed.alias( "context.channel" ),

		isSubscribed: computed.readOnly( "channel.isSubscribed" ),
		isFollowing : computed.readOnly( "channel.isFollowing" ),
		isFollowingL: computed.readOnly( "channel.isFollowingLoading" ),

		subscrClass : computed( "isSubscribed", function() {
			return get( this, "isSubscribed" ) ? "btn-success" : "btn-primary";
		}),

		followAction: following( "follow", "follow", null ),
		followClass : following( "btn-success", "btn-danger", "btn-info" ),
		followIcon  : following( "fa-heart", "fa-heart-o", "fa-question" ),
		followTitle : following( "Unfollow channel", "Follow channel", "" )
	});

});
