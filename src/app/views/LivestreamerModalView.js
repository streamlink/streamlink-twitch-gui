define( [ "ember", "views/ModalView" ], function( Ember, ModalView ) {

	var get = Ember.get;

	function following( yes, no, unknown ) {
		return function() {
			return get( this, "isFollowingL" )
				? unknown
				: get( this, "isFollowing" )
					? yes
					: no;
		}.property( "isFollowing", "isFollowingL" );
	}

	return ModalView.extend({
		classNames: [ "mymodal", "modal-livestreamer" ],

		isSubscribed: Ember.computed.readOnly( "context.active.channel.isSubscribed" ),
		isFollowing : Ember.computed.readOnly( "context.active.channel.isFollowing" ),
		isFollowingL: Ember.computed.readOnly( "context.active.channel.isFollowingLoading" ),

		followAction: following( "follow", "follow", null ),
		followClass : following( "btn-success", "btn-danger", "btn-info" ),
		followIcon  : following( "fa-heart", "fa-heart-o", "fa-question" ),
		followTitle : following( "Unfollow channel", "Follow channel", "" ),

		subscrClass: function() {
			return get( this, "isSubscribed" ) ? "btn-success" : "btn-primary";
		}.property( "isSubscribed" )
	});

});
