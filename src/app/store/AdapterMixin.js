define( [ "ember" ], function( Ember ) {

	var get   = Ember.get,
	    push  = [].push,
	    reURL = /^[a-z]+:\/\/([\w\.]+)\/(.+)$/i;


	/**
	 * Adapter mixin for using static model names
	 * instead of using type.typeKey as name
	 */
	return Ember.Mixin.create( Ember.Evented, {
		find: function( store, type, id, snapshot ) {
			return this.ajax( this.buildURL( type, id, snapshot ), "GET" );
		},

		findAll: function( store, type, sinceToken ) {
			var query = sinceToken ? { since: sinceToken } : undefined;
			return this.ajax( this.buildURL( type ), "GET", { data: query } );
		},

		findQuery: function( store, type, query ) {
			return this.ajax( this.buildURL( type ), "GET", { data: query } );
		},

		createRecordMethod: "POST",
		createRecord: function( store, type, snapshot ) {
			return this.ajax(
				this.buildURL( type, snapshot.id, snapshot ),
				get( this, "createRecordMethod" ),
				this.createRecordData( store, type, snapshot )
			)
				.then(function( data ) {
					this.trigger( "createRecord", store, type, snapshot );
					return data;
				}.bind( this ) );
		},
		createRecordData: function( store, type, snapshot ) {
			var data = {},
			    serializer = store.serializerFor( type.typeKey );
			serializer.serializeIntoHash( data, type, snapshot, { includeId: true } );
			return { data: data };
		},

		updateRecordMethod: "PUT",
		updateRecord: function( store, type, snapshot ) {
			return this.ajax(
				this.buildURL( type, snapshot.id, snapshot ),
				get( this, "updateRecordMethod" ),
				this.updateRecordData( store, type, snapshot )
			)
				.then(function( data ) {
					this.trigger( "updateRecord", store, type, snapshot );
					return data;
				}.bind( this ) );
		},
		updateRecordData: function( store, type, snapshot ) {
			var data = {},
			    serializer = store.serializerFor( type.typeKey );
			serializer.serializeIntoHash( data, type, snapshot );
			return { data: data };
		},

		deleteRecord: function( store, type, snapshot ) {
			return this.ajax(
				this.buildURL( type, snapshot.id, snapshot ),
				"DELETE"
			)
				.then(function( data ) {
					this.trigger( "deleteRecord", store, type, snapshot );
					return data;
				}.bind( this ) );
		},

		buildURL: function( type, id ) {
			var host = get( this, "host" ),
			    ns   = get( this, "namespace" ),
			    url  = [ host ];

			// append the adapter specific namespace
			if (   ns ) { push.call( url, ns ); }
			// append the type fragments (and process the dynamic ones)
			if ( type ) { push.apply( url, this.buildURLFragments( type.toString() ) ); }
			// append the type's ID at the end
			if (   id ) { push.call( url, id ); }

			return url.join( "/" );
		},

		buildURLFragments: function( url ) {
			return url.split( "/" );
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
