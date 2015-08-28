define([
	"Ember",
	"mixins/InfiniteScrollViewMixin",
	"text!templates/user/followedchannels.html.hbs"
], function( Ember, InfiniteScrollViewMixin, template ) {

	var get = Ember.get;

	function isActive( key, value ) {
		return function() {
			return get( this, key ) === value ? "" : "inactive";
		}.property( key );
	}

	return Ember.View.extend( InfiniteScrollViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-followed-channels" ],

		sortbyCreatedClass  : isActive( "context.sortby", "created_at" ),
		sortbyBroadcastClass: isActive( "context.sortby", "last_broadcast" ),
		sortbyLoginClass    : isActive( "context.sortby", "login" ),

		directionDescClass: isActive( "context.direction", "desc" ),
		directionAscClass : isActive( "context.direction", "asc" )
	});

});
