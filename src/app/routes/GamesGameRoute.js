define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScroll, preload ) {

	return Ember.Route.extend( InfiniteScroll, {
		itemSelector: ".stream-component",
		itemHeight: 207,

		model: function( params ) {
			Ember.set( this, "game", Ember.get( params || {}, "game" ) );

			return this.store.findQuery( "twitchStream", {
				game	: Ember.get( this, "game" ),
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium" ) );
		},

		setupController: function( controller, model ) {
			this._super.apply( this, arguments );

			controller.set( "game", Ember.get( this, "game" ) );
		}
	});

});
