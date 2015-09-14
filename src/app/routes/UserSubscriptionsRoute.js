define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollMixin",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollMixin,
	preload
) {

	var get = Ember.get;
	var set = Ember.set;

	return UserIndexRoute.extend( InfiniteScrollMixin, {
		itemSelector: ".stream-component",

		model: function() {
			var store = get( this, "store" );

			return store.query( "twitchTicket", {
				offset : get( this, "offset" ),
				limit  : get( this, "limit" ),
				unended: true
			})
				.then(function( data ) {
					return data.toArray().filterBy( "product.ticket_type", "chansub" );
				})
				.then(function( data ) {
					// The partner_login (channel) reference is loaded asynchronously
					// just get the PromiseProxy object and wait for it to resolve
					var promises = data.mapBy( "product.partner_login" );
					return Promise.all( promises )
						.then(function( channels ) {
							// Also load the UserSubscription record (needed for subscription date)
							// Sadly, this can't be loaded in parallel (channel needs to be loaded)
							return Promise.all( channels.map(function( channel ) {
								var id = get( channel, "id" );
								return store.findExistingRecord( "twitchUserSubscription", id )
									.catch(function() { return false; })
									.then(function( record ) {
										set( channel, "subscribed", record );
									});
							}) );
						})
						.then(function() {
							return data;
						});
				})
				.then(function( data ) {
					var emoticons = data.mapBy( "product.emoticons" ).reduce(function( res, item ) {
						return res.concat( item.toArray() );
					}, [] );

					return Promise.all([
						Promise.resolve( data ).then( preload([
							"product.partner_login.logo",
							"product.partner_login.profile_banner",
							"product.partner_login.video_banner"
						]) ),
						Promise.resolve( emoticons ).then( preload(
							"url"
						) )
					])
						.then(function() {
							return data;
						});
				});
		}
	});

});
