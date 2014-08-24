define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		reURL = /^[a-z]+:\/\/([\w\.]+)\/(.+)$/i;

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
			var	url	= [ get( this, "host" ) ],
				ns	= get( this, "namespace" );

			if (   ns ) { url.push( ns ); }
			if ( type ) { url.push( type.toString() ); }
			if (   id ) { url.push( id ); }

			return url.join( "/" );
		},

		ajax: function( url, type, options ) {
			var adapter = this;

			return new Promise(function( resolve, reject ) {
				var hash = adapter.ajaxOptions( url, type, options );

				hash.success = function( json ) {
					Ember.run( null, resolve, json );
				};

				hash.error = function( jqXHR ) {
					Ember.run( null, reject, adapter.ajaxError( jqXHR, url ) );
				};

				Ember.$.ajax( hash );
			});
		},

		ajaxOptions: function() {
			var hash = this._super.apply( this, arguments );
			hash.timeout = 10000;
			hash.cache = false;

			return hash;
		},

		ajaxError: function( jqXHR, url ) {
			jqXHR = this._super.apply( this, arguments );

			url = reURL.exec( url );
			jqXHR.host = url && url[1] || get( this, "host" );
			jqXHR.path = url && url[2] || get( this, "namespace" );

			return new Ember.XHRError( jqXHR );
		}
	});

});
