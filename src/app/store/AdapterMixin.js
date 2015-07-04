define( [ "Ember" ], function( Ember ) {

	var get   = Ember.get;
	var push  = [].push;
	var reURL = /^[a-z]+:\/\/([\w\.]+)\/(.+)$/i;


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
