define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var readOnly = Ember.computed.readOnly;

	function following( yes, no, unknown ) {
		return function() {
			return get( this, "isFollowingL" )
				? unknown
				: get( this, "isFollowing" )
					? yes
					: no;
		}.property( "isFollowing", "isFollowingL" );
	}

	return Ember.Mixin.create({
		channel     : alias( "context.channel" ),

		isSubscribed: readOnly( "channel.isSubscribed" ),
		isFollowing : readOnly( "channel.isFollowing" ),
		isFollowingL: readOnly( "channel.isFollowingLoading" ),

		subscrClass : function() {
			return get( this, "isSubscribed" ) ? "btn-success" : "btn-primary";
		}.property( "isSubscribed" ),

		followAction: following( "follow", "follow", null ),
		followClass : following( "btn-success", "btn-danger", "btn-info" ),
		followIcon  : following( "fa-heart", "fa-heart-o", "fa-question" ),
		followTitle : following( "Unfollow channel", "Follow channel", "" )
	});

});
