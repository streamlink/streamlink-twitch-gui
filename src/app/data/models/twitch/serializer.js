import EmbeddedRecordsMixin from "ember-data/serializers/embedded-records-mixin";
import RESTSerializer from "ember-data/serializers/rest";


export default class TwitchSerializer extends RESTSerializer.extend( EmbeddedRecordsMixin ) {
	isNewSerializerAPI = true;

	primaryKey = "_id";

	/**
	 * All underscored properties contain metadata (except the primaryKey)
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {Object} payload
	 */
	extractMeta( store, type, payload ) {
		if ( !payload ) { return; }

		const primaryKey = this.primaryKey;
		const data = {};

		Object.keys( payload ).forEach( key => {
			if ( key.charAt( 0 ) === "_" && key !== primaryKey ) {
				data[ key.substr( 1 ) ] = payload[ key ];
				delete payload[ key ];
			}
		});

		return data;
	}
}
