define([
	"Ember",
	"mixins/InfiniteScrollViewMixin",
	"text!templates/games/game.html.hbs"
], function( Ember, InfiniteScrollViewMixin, template ) {

	var get = Ember.get;
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

	return Ember.View.extend( InfiniteScrollViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-gamesgame" ],

		isFollowing : readOnly( "context.isFollowing" ),
		isFollowingL: readOnly( "context.isFollowingLoading" ),

		followAction: following( "followGame", "followGame", null ),
		followClass : following( "btn-success", "btn-danger", "btn-info" ),
		followIcon  : following( "fa-heart", "fa-heart-o", "fa-question" ),
		followTitle : following( "Unfollow game", "Follow game", "" )
	});

});
