define( [ "ember", "ember-data" ], function( Ember, DS ) {

	return DS.RESTSerializer.extend( DS.EmbeddedRecordsMixin, {
		primaryKey: "_id",

		/**
		 * All underscored properties contain metadata (except the primaryKey)
		 * @param {DS.Store} store
		 * @param {DS.Model} type
		 * @param {Object} payload
		 */
		extractMeta: function( store, type, payload ) {
			if ( !payload ) { return; }

			var primaryKey = Ember.get( this, "primaryKey" ),
			    data = {};

			Object.keys( payload ).forEach(function( key ) {
				if ( key.charAt( 0 ) === "_" && key !== primaryKey ) {
					data[ key.substr( 1 ) ] = payload[ key ];
					delete payload[ key ];
				}
			});

			store.setMetadataFor( type, data );
		},


		/**
		 * Also extract metadata from all embedded records
		 * @see DS.EmbeddedRecordsMixin.normalize
		 * @param {DS.Model} type
		 * @param {Object} hash
		 * @returns {Object}
		 */
		normalize: function( type, hash ) {
			this.extractMeta( this.store, type, hash );
			return this._super.apply( this, arguments );
		}
	});

});
