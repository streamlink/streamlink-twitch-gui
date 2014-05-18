define( [ "ember" ],function( Ember ) {

	return Ember.Mixin.create({
		offset: 0,
		limit: 12,
		maxAutoFetches: 3,


		beforeModel: function() {
			this._super.apply( this, arguments );

			this.set( "offset", 0 );
		},

		setupController: function( controller ) {
			this._super.apply( this, arguments );

			controller.set( "isFetching", false );
			controller.set( "hasFetchedAll", false );
		},

		fetchContent: function() {
			return this.model();
		},

		actions: {
			"willFetchContent": function( force ) {
				var controller = this.get( "controller" );
				if ( !controller.get( "isFetching" ) && !controller.get( "hasFetchedAll" ) ) {
					// don't fetch more than 3 times automatically
					var numFetches = this.get( "offset" ) / this.get( "limit" );
					if ( !force && this.get( "maxAutoFetches" ) <= numFetches ) {
						return;
					}

					controller.toggleProperty( "isFetching" );
					this.incrementProperty( "offset", this.get( "limit" ) );

					// fetch content and append to ArrayController
					this.fetchContent().then(function( content ) {
						if ( !content || !content.length ) {
							controller.set( "hasFetchedAll", true );
						} else {
							controller.pushObjects( content );
						}
						controller.toggleProperty( "isFetching" );
					}.bind( this ) );
				}
			}
		}
	});

});
