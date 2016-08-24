import DS from "EmberData";


export default DS.RESTSerializer.extend( DS.EmbeddedRecordsMixin, {
	isNewSerializerAPI: true,

	primaryKey: "_id",

	/**
	 * All underscored properties contain metadata (except the primaryKey)
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {Object} payload
	 */
	extractMeta: function( store, type, payload ) {
		if ( !payload ) { return; }

		var primaryKey = this.primaryKey;
		var data = {};

		Object.keys( payload ).forEach(function( key ) {
			if ( key.charAt( 0 ) === "_" && key !== primaryKey ) {
				data[ key.substr( 1 ) ] = payload[ key ];
				delete payload[ key ];
			}
		});

		return data;
	}
});
