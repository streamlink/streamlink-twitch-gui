define( [ "ember", "ember-data" ], function( Ember, DS ) {

	/**
	 * Adapter mixin for using static model names
	 * instead of using type.typeKey as name
	 */
	return Ember.Mixin.create({
		find: function( store, type, id ) {
			return this.ajax( this.buildURL( type, id ), "GET" );
		},

		findAll: function( store, type, sinceToken ) {
			var query = sinceToken ? { since: sinceToken } : undefined;
			return this.ajax( this.buildURL( type ), "GET", { data: query } );
		},

		findQuery: function( store, type, query ) {
			return this.ajax( this.buildURL( type ), "GET", { data: query } );
		},

		buildURL: function( type, id ) {
			var	url	= [ Ember.get( this, "host" ) ],
				ns	= Ember.get( this, "namespace" );

			if (   ns ) { url.push( ns ); }
			if ( type ) { url.push( type.toString() ); }
			if (   id ) { url.push( id ); }

			return url.join( "/" );
		},

		defaultSerializer: DS.RESTSerializer
	});

});
