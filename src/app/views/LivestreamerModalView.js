define( [ "ember", "views/ModalView" ], function( Ember, ModalView ) {

	function following( yes, no, unknown ) {
		return function() {
			return this.get( "following_l" )
				? unknown
				: this.get( "following" )
					? yes
					: no;
		}.property( "following", "following_l" );
	}

	return ModalView.extend({
		classNames: [ "mymodal", "modal-livestreamer" ],

		isLoggedIn: Ember.computed.readOnly( "context.auth.isLoggedIn" ),

		following  : Ember.computed.readOnly( "context.current.following" ),
		following_l: Ember.computed.readOnly( "context.current.following_loading" ),

		followAction: following( "follow", "follow", null ),
		followClass : following( "btn-success", "btn-danger", "btn-info" ),
		followIcon  : following( "fa-heart", "fa-heart-o", "fa-question" ),
		followTitle : following( "Unfollow channel", "Follow channel", "" )
	});

});
