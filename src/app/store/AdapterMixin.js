define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get   = Ember.get;
	var push  = [].push;
	var reURL = /^[a-z]+:\/\/([\w\.]+)\/(.+)$/i;
	var AdapterError = DS.AdapterError;


	/**
	 * Adapter mixin for using static model names
	 * instead of using type.modelName as name
	 */
	return Ember.Mixin.create( Ember.Evented, {
		find: function( store, type, id, snapshot ) {
			var url = this.buildURL( type, id, snapshot, "find" );
			return this.ajax( url, "GET" );
		},

		findAll: function( store, type, sinceToken ) {
			var url   = this.buildURL( type, null, null, "findAll" );
			var query = sinceToken ? { since: sinceToken } : undefined;
			return this.ajax( url, "GET", { data: query } );
		},

		findQuery: function( store, type, query ) {
			var url = this.buildURL( type, query, null, "findQuery" );
			query = this.sortQueryParams ? this.sortQueryParams( query ) : query;
			return this.ajax( url, "GET", { data: query } );
		},

		createRecordMethod: "POST",
		createRecord: function( store, type, snapshot ) {
			var self   = this;
			var url    = self.buildURL( type, null, snapshot, "createRecord" );
			var method = get( self, "createRecordMethod" );
			var data   = self.createRecordData( store, type, snapshot );
			return self.ajax( url, method, data )
				.then(function( data ) {
					self.trigger( "createRecord", store, type, snapshot );
					return data;
				});
		},
		createRecordData: function( store, type, snapshot ) {
			var data = {};
			var serializer = store.serializerFor( type.modelName );
			serializer.serializeIntoHash( data, type, snapshot, { includeId: true } );
			return { data: data };
		},

		updateRecordMethod: "PUT",
		updateRecord: function( store, type, snapshot ) {
			var self   = this;
			var url    = self.buildURL( type, snapshot.id, snapshot, "updateRecord" );
			var method = get( self, "updateRecordMethod" );
			var data   = self.updateRecordData( store, type, snapshot );
			return self.ajax( url, method, data )
				.then(function( data ) {
					self.trigger( "updateRecord", store, type, snapshot );
					return data;
				});
		},
		updateRecordData: function( store, type, snapshot ) {
			var data = {};
			var serializer = store.serializerFor( type.modelName );
			serializer.serializeIntoHash( data, type, snapshot );
			return { data: data };
		},

		deleteRecord: function( store, type, snapshot ) {
			var self = this;
			var url  = self.buildURL( type, snapshot.id, snapshot, "deleteRecord" );
			return self.ajax( url, "DELETE" )
				.then(function( data ) {
					self.trigger( "deleteRecord", store, type, snapshot );
					return data;
				});
		},


		urlForCreateRecord: function( modelName, snapshot ) {
			// Why does Ember-Data do this?
			// the id is missing on BuildURLMixin.urlForCreateRecord
			return this._buildURL( modelName, snapshot.id );
		},

		/**
		 * Custom buildURL method with type instead of modelName
		 * @param {DS.Model} type
		 * @param {string?} id
		 * @returns {string}
		 */
		_buildURL: function( type, id ) {
			var host = get( this, "host" );
			var ns   = get( this, "namespace" );
			var url  = [ host ];

			// append the adapter specific namespace
			if ( ns ) { push.call( url, ns ); }
			// append the type fragments (and process the dynamic ones)
			push.apply( url, this.buildURLFragments( type, id ) );

			return url.join( "/" );
		},

		/**
		 * Custom method for building URL fragments
		 * @param {DS.Model} type
		 * @param {string?} id
		 * @returns {string[]}
		 */
		buildURLFragments: function( type, id ) {
			var path = type.toString();
			var url  = path.split( "/" );
			if ( !Ember.isNone( id ) ) { push.call( url, id ); }
			return url;
		},


		ajax: function( url ) {
			var adapter = this;
			return this._super.apply( this, arguments )
				.catch(function( err ) {
					if ( err instanceof AdapterError ) {
						var _url = reURL.exec( url );
						err.host = _url && _url[1] || get( adapter, "host" );
						err.path = _url && _url[2] || get( adapter, "namespace" );
					}
					return Promise.reject( err );
				});
		},

		ajaxOptions: function() {
			var hash = this._super.apply( this, arguments );
			hash.timeout = 10000;
			hash.cache = false;

			return hash;
		},

		isSuccess: function( status, headers, payload ) {
			return this._super.apply( this, arguments )
			    && ( payload ? !payload.error : true );
		},

		handleResponse: function( status, headers, payload ) {
			if ( this.isSuccess( status, headers, payload ) ) {
				return payload;
			} else if ( this.isInvalid( status, headers, payload ) ) {
				return new DS.InvalidError( payload && payload.errors || [] );
			}

			return new AdapterError([{
				name   : "HTTP Error",
				message: payload && payload.error || "Failed to load resource",
				detail : payload && payload.message,
				status : status
			}]);
		}

	});

});
