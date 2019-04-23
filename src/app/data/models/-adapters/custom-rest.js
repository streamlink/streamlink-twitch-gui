import Evented from "@ember/object/evented";
import RESTAdapter from "ember-data/adapters/rest";
import { AdapterError, InvalidError, TimeoutError } from "ember-data/adapters/errors";
import fetch from "fetch";
import { descriptor, urlFragments } from "utils/decorators";


const reURL = /^[a-z]+:\/\/([\w.]+)\/(.+)$/i;
const reURLFragment = /^:(\w+)$/;

const { hasOwnProperty } = {};


@urlFragments({
	id( type, id ) {
		if ( id === null || id === undefined ) {
			throw new Error( "Unknown ID" );
		}

		return id;
	}
})
/**
 * Adapter for using static model names
 * instead of using type.modelName as name
 * TODO: Change this and get the URL from the model's adapter instead of the model's toString().
 *       EmberData has added a more dynamic system for configuring request URLs a long time ago...
 */
export default class CustomRESTAdapter extends RESTAdapter.extend( Evented ) {
	@descriptor({ value: true })
	useFetch;


	findRecord( store, type, id, snapshot ) {
		const url = this.buildURL( type, id, snapshot, "findRecord" );

		return this.ajax( url, "GET" );
	}

	findAll( store, type, sinceToken ) {
		const url = this.buildURL( type, null, null, "findAll" );
		const query = sinceToken ? { since: sinceToken } : undefined;

		return this.ajax( url, "GET", { data: query } );
	}

	query( store, type, query ) {
		const url = this.buildURL( type, null, null, "query", query );
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: query } );
	}

	queryRecord( store, type, query ) {
		const url = this.buildURL( type, null, null, "queryRecord", query );
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: query } );
	}


	createRecordMethod = "POST";
	async createRecord( store, type, snapshot ) {
		const url = this.buildURL( type, null, snapshot, "createRecord" );
		const data = this.createRecordData( store, type, snapshot );

		const payload = await this.ajax( url, this.createRecordMethod, data );
		this.trigger( "createRecord", store, type, snapshot );

		return payload;
	}
	createRecordData( store, type, snapshot ) {
		const data = {};
		const serializer = store.serializerFor( type.modelName );
		serializer.serializeIntoHash( data, type, snapshot, { includeId: true } );

		return { data: data };
	}

	updateRecordMethod = "PUT";
	async updateRecord( store, type, snapshot ) {
		const url = this.buildURL( type, snapshot.id, snapshot, "updateRecord" );
		const data = this.updateRecordData( store, type, snapshot );

		const payload = await this.ajax( url, this.updateRecordMethod, data );
		this.trigger( "updateRecord", store, type, snapshot );

		return payload;
	}
	updateRecordData( store, type, snapshot ) {
		const data = {};
		const serializer = store.serializerFor( type.modelName );
		serializer.serializeIntoHash( data, type, snapshot );

		return { data: data };
	}

	async deleteRecord( store, type, snapshot ) {
		const url = this.buildURL( type, snapshot.id, snapshot, "deleteRecord" );

		const payload = await this.ajax( url, "DELETE" );
		this.trigger( "deleteRecord", store, type, snapshot );

		return payload;
	}


	urlForCreateRecord( modelName, snapshot ) {
		// Why does Ember-Data do this?
		// the id is missing on BuildURLMixin.urlForCreateRecord
		return this._buildURL( modelName, snapshot.id );
	}

	/**
	 * Custom buildURL method with type instead of modelName
	 * @param {Model} type
	 * @param {(Number|String)?} id
	 * @param {*?} data
	 * @returns {String}
	 */
	_buildURL( type, id, data ) {
		const { host, namespace } = this;
		const url = [ host ];

		// append the adapter specific namespace
		if ( namespace ) { url.push( namespace ); }
		// append the type fragments (and process the dynamic ones)
		url.push( ...this.buildURLFragments( type, id, data ) );

		return url.join( "/" );
	}

	/**
	 * Dynamic URL fragments
	 * @param {Model} type
	 * @param {(Number|String)?} id
	 * @param {*?} data
	 * @returns {String[]}
	 */
	buildURLFragments( type, id, data ) {
		const urlFragments = this.constructor.urlFragments;
		let idFound = false;

		const url = String( type )
			.split( "/" )
			.map( fragment => fragment.replace( reURLFragment, ( _, key ) => {
				if ( key === "id" ) {
					idFound = true;
				}

				if ( hasOwnProperty.call( urlFragments, key ) ) {
					return urlFragments[ key ].call( this, type, id, data );
				}

				// unknown fragment
				throw new Error( `Unknown URL fragment: ${key}` );
			}) );

		// append ID if no :id fragment was defined and ID exists
		if ( !idFound && id !== null && id !== undefined ) {
			url.push( id );
		}

		return url;
	}


	async ajax( url ) {
		try {
			return await super.ajax( ...arguments );

		} catch ( err ) {
			if ( err instanceof AdapterError ) {
				const _url = reURL.exec( url );
				err.host = _url && _url[1] || this.host;
				err.path = _url && _url[2] || this.namespace;
			}

			throw err;
		}
	}

	ajaxOptions() {
		const options = super.ajaxOptions( ...arguments );
		options.cache = "no-cache";

		return options;
	}

	_fetchRequest( options ) {
		return new Promise( ( resolve, reject ) => {
			const timeout = setTimeout( () => {
				reject( new TimeoutError() );
			}, options.timeout || 10000 );

			fetch( options.url, options )
				.finally( () => clearTimeout( timeout ) )
				.then( resolve, reject );
		});
	}

	isSuccess( status, headers, payload ) {
		return super.isSuccess( ...arguments )
		    && ( payload ? !payload.error : true );
	}

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
}
