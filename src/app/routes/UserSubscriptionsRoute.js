define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/ChannelMixin",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	ChannelMixin,
	InfiniteScrollRouteMixin,
	preload
) {

	var get = Ember.get;

	return UserIndexRoute.extend( ChannelMixin, InfiniteScrollRouteMixin, {
		itemSelector: ".stream-component",

		model: function() {
			var self = this;

			return get( this, "store" ).query( "twitchTicket", {
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
								return self.checkUserSubscribesChannel( channel );
							}) );
						})
						.then(function() {
							return data;
						});
				})
				.then( preload([
					"@each.product.@each.partner_login.@each.logo",
					"@each.product.@each.partner_login.@each.profile_banner",
					"@each.product.@each.emoticons.firstObject.@each.url"
				]) );
		}
	});

});
