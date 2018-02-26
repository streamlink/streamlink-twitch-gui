import { get } from "@ember/object";
import Evented from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { isNone } from "@ember/utils";
import { AdapterError, InvalidError } from "ember-data/adapters/errors";


const reURL = /^[a-z]+:\/\/([\w.]+)\/(.+)$/i;
const reURLFragment = /^:(\w+)$/;


/**
 * Adapter mixin for using static model names
 * instead of using type.modelName as name
 */
export default Mixin.create( Evented, {
	mergedProperties: [ "urlFragments" ],

	urlFragments: {
		id( type, id ) {
			if ( isNone( id ) ) {
				throw new Error( "Unknown ID" );
			}

			return id;
		}
	},

	findRecord( store, type, id, snapshot ) {
		const url = this.buildURL( type, id, snapshot, "findRecord" );

		return this.ajax( url, "GET" );
	},

	findAll( store, type, sinceToken ) {
		const url = this.buildURL( type, null, null, "findAll" );
		const query = sinceToken ? { since: sinceToken } : undefined;

		return this.ajax( url, "GET", { data: query } );
	},

	query( store, type, query ) {
		const url = this.buildURL( type, null, null, "query", query );
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: query } );
	},

	queryRecord( store, type, query ) {
		const url = this.buildURL( type, null, null, "queryRecord", query );
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: query } );
	},


	createRecordMethod: "POST",
	createRecord( store, type, snapshot ) {
		const url = this.buildURL( type, null, snapshot, "createRecord" );
		const method = get( this, "createRecordMethod" );
		const data = this.createRecordData( store, type, snapshot );

		return this.ajax( url, method, data )
			.then( data => {
				this.trigger( "createRecord", store, type, snapshot );
				return data;
			});
	},
	createRecordData( store, type, snapshot ) {
		const data = {};
		const serializer = store.serializerFor( type.modelName );
		serializer.serializeIntoHash( data, type, snapshot, { includeId: true } );

		return { data: data };
	},

	updateRecordMethod: "PUT",
	updateRecord( store, type, snapshot ) {
		const url = this.buildURL( type, snapshot.id, snapshot, "updateRecord" );
		const method = get( this, "updateRecordMethod" );
		const data = this.updateRecordData( store, type, snapshot );

		return this.ajax( url, method, data )
			.then( data => {
				this.trigger( "updateRecord", store, type, snapshot );
				return data;
			});
	},
	updateRecordData( store, type, snapshot ) {
		const data = {};
		const serializer = store.serializerFor( type.modelName );
		serializer.serializeIntoHash( data, type, snapshot );

		return { data: data };
	},

	deleteRecord( store, type, snapshot ) {
		const url = this.buildURL( type, snapshot.id, snapshot, "deleteRecord" );

		return this.ajax( url, "DELETE" )
			.then( data => {
				this.trigger( "deleteRecord", store, type, snapshot );
				return data;
			});
	},


	urlForCreateRecord( modelName, snapshot ) {
		// Why does Ember-Data do this?
		// the id is missing on BuildURLMixin.urlForCreateRecord
		return this._buildURL( modelName, snapshot.id );
	},

	/**
	 * Custom buildURL method with type instead of modelName
	 * @param {Model} type
	 * @param {(Number|String)?} id
	 * @param {*?} data
	 * @returns {String}
	 */
	_buildURL( type, id, data ) {
		const host = get( this, "host" );
		const ns = get( this, "namespace" );
		const url = [ host ];

		// append the adapter specific namespace
		if ( ns ) { url.push( ns ); }
		// append the type fragments (and process the dynamic ones)
		url.push( ...this.buildURLFragments( type, id, data ) );

		return url.join( "/" );
	},

	/**
	 * Dynamic URL fragments
	 * @param {Model} type
	 * @param {(Number|String)?} id
	 * @param {*?} data
	 * @returns {String[]}
	 */
	buildURLFragments( type, id, data ) {
		const urlFragments = get( this, "urlFragments" );
		let idFound = false;

		const url = String( type )
			.split( "/" )
			.map( fragment => fragment.replace( reURLFragment, ( _, key ) => {
				if ( key === "id" ) {
					idFound = true;
				}

				if ( urlFragments.hasOwnProperty( key ) ) {
					return urlFragments[ key ].call( this, type, id, data );
				}

				// unknown fragment
				throw new Error( `Unknown URL fragment: ${key}` );
			}) );

		// append ID if no :id fragment was defined and ID exists
		if ( !idFound && !isNone( id ) ) {
			url.push( id );
		}

		return url;
	},


	ajax( url ) {
		return this._super( ...arguments )
			.catch( err => {
				if ( err instanceof AdapterError ) {
					const _url = reURL.exec( url );
					err.host = _url && _url[1] || get( this, "host" );
					err.path = _url && _url[2] || get( this, "namespace" );
				}

				return Promise.reject( err );
			});
	},

	ajaxOptions() {
		const hash = this._super( ...arguments );
		hash.timeout = 10000;
		hash.cache = false;

		return hash;
	},

	isSuccess( status, headers, payload ) {
		return this._super( ...arguments )
		    && ( payload ? !payload.error : true );
	},

	handleResponse( status, headers, payload ) {
		if ( this.isSuccess( status, headers, payload ) ) {
			return payload;
		} else if ( this.isInvalid( status, headers, payload ) ) {
			return new InvalidError( payload && payload.errors || [] );
		}

		return new AdapterError([{
			name   : "HTTP Error",
			message: payload && payload.error || "Failed to load resource",
			detail : payload && payload.message,
			status
		}]);
	}

});
