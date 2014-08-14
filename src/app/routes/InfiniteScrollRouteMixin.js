define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;

	return Ember.Mixin.create({
		offset: 0,
		limit: 12,
		maxAutoFetches: 3,


		beforeModel: function() {
			this._super.apply( this, arguments );

			set( this, "offset", 0 );
		},

		setupController: function( controller, model ) {
			var	num	= get( model, "length" ),
				max	= get( this, "limit" );

			this._super.apply( this, arguments );

			set( controller, "isFetching", false );
			set( controller, "hasFetchedAll", num < max );
		},

		fetchContent: function() {
			return this.model();
		},

		actions: {
			"willFetchContent": function( force ) {
				var	controller	= get( this, "controller" ),
					isFetching	= get( controller, "isFetching" ),
					fetchedAll	= get( controller, "hasFetchedAll" );

				if ( !isFetching && !fetchedAll ) {
					var	offset	= get( this, "offset" ),
						limit	= get( this, "limit" ),
						max		= get( this, "maxAutoFetches" ),
						num		= offset / limit;

					// don't fetch more than 3 times automatically
					if ( !force && num > max ) { return; }

					set( controller, "isFetching", true );
					set( this, "offset", offset + limit );

					// fetch content and append to ArrayController
					this.fetchContent().then(function( content ) {
						if ( !content || !content.length ) {
							set( controller, "hasFetchedAll", true );
						} else {
							controller.pushObjects( content );
						}
						set( controller, "isFetching", false );
					}.bind( this ) );
				}
			}
		}
	});

});
