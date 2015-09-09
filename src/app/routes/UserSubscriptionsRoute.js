define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollRouteMixin,
	preload
) {

	var get = Ember.get;
	var set = Ember.set;

	return UserIndexRoute.extend( InfiniteScrollRouteMixin, {
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
				.then( preload([
					"@each.product.@each.partner_login.@each.logo",
					"@each.product.@each.partner_login.@each.profile_banner",
					"@each.product.@each.partner_login.@each.video_banner",
					"@each.product.@each.emoticons.firstObject.@each.url"
				]) );
		}
	});

});
