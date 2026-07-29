import EmbeddedRecordsMixin from "ember-data/serializers/embedded-records-mixin";
import RESTSerializer from "ember-data/serializers/rest";


const { hasOwnProperty } = {};


export default RESTSerializer.extend( EmbeddedRecordsMixin, {
	isNewSerializerAPI: true,

	primaryKey: "id",

	/**
	 * Override "data" payload key with model name recognized by EmberData
	 * @param {DS.Store} store
	 * @param {DS.Model} primaryModelClass
	 * @param {Object} payload
	 * @param {string|null} id
	 * @param {string} requestType
	 * @return {Object}
	 */
	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		if ( !payload || !hasOwnProperty.call( payload, "data" ) ) {
			throw new Error( "Unknown payload format of the API response" );
		}

		const key = this.modelNameFromPayloadKey();
		payload[ key ] = payload[ "data" ] || [];
		delete payload[ "data" ];

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	/**
	 * Turn Twitch's array response into a single response
	 * @param {DS.Store} store
	 * @param {DS.Model} primaryModelClass
	 * @param {Object} payload
	 * @param {string|null} id
	 * @param {string} requestType
	 * @return {Object}
	 */
	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		const key = this.modelNameFromPayloadKey();
		const data = payload[ key ] = payload[ key ][0];
		if ( !data ) {
			throw new Error( "Missing data while normalizing single response" );
		}

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	/**
	 * Extract metadata and remove metadata properties from payload
	 * Everything except the model-name (overridden by normalizeResponse) is considered metadata
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {Object} payload
	 */
	extractMeta( store, type, payload ) {
		/* istanbul ignore next */
		if ( !payload ) { return; }

		const data = {};
		const dataKey = this.modelNameFromPayloadKey();
		for ( const [ key, value ] of Object.entries( payload ) ) {
			if ( key === dataKey ) { continue; }
			const type = typeof value;
			switch ( key ) {
				case "pagination":
					if ( type === "object" && hasOwnProperty.call( value, "cursor" ) ) {
						data[ "pagination" ] = {
							cursor: String( value[ "cursor" ] )
						};
					}
					break;
				default:
					// ignore non-primitive values
					if ( type === "string" || type === "number" ) {
						data[ key ] = value;
					}
			}
			delete payload[ key ];
		}

		return data;
	}
});
