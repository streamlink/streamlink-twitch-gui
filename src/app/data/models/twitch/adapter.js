import { get, observer } from "@ember/object";
import RESTAdapter from "ember-data/adapters/rest";
import { twitch } from "config";
import AdapterMixin from "data/models/-mixins/adapter";


const { oauth: { "client-id": clientId } } = twitch;


export default RESTAdapter.extend( AdapterMixin, {
	host: "https://api.twitch.tv",
	namespace: "",
	headers: {
		"Client-ID": clientId
	},

	defaultSerializer: "twitch",

	coalesceFindRequests: false,
	findIdParam: null,
	findIdSeparator: null,
	findIdMax: 100,


	access_token: null,
	tokenObserver: observer( "access_token", function() {
		const token = get( this, "access_token" );
		if ( token === null ) {
			delete this.headers[ "Authorization" ];
		} else {
			this.headers[ "Authorization" ] = `Bearer ${token}`;
		}
	}),


	createRecordMethod: "PUT",
	createRecordData() {
		// we don't need to send any data with the request (yet?)
		return {};
	},

	updateRecordData() {
		// we don't need to send any data with the request (yet?)
		return {};
	},

	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {string} id
	 * @param {DS.Snapshot} snapshot
	 * @return {Promise}
	 */
	findRecord( store, type, id, snapshot ) {
		const url = this.buildURL( type, null, snapshot, "findRecord" );
		const paramName = this.findIdParam || store.serializerFor( type.modelName ).primaryKey;
		const data = {
			[ paramName ]: id
		};

		return this.ajax( url, "GET", { data } );
	},

	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {string[]} ids
	 * @param {DS.Snapshot[]} snapshots
	 * @return {Promise}
	 */
	findMany( store, type, ids, snapshots ) {
		const url = this.buildURL( type, null, snapshots, "findMany" );
		const paramName = this.findIdParam || store.serializerFor( type.modelName ).primaryKey;
		const data = this.findIdSeparator
			? { [ paramName ]: ids.join( this.findIdSeparator ) }
			: ids.map( id => ({ name: paramName, value: id }) );

		return this.ajax( url, "GET", { data } );
	},


	/**
	 * @param {DS.Store} store
	 * @param {DS.Snapshot[]} snapshots
	 * @return {Array<Array<DS.Snapshot>>}
	 */
	groupRecordsForFindMany( store, snapshots ) {
		const snapshotsByType = new Map();

		// group snapshots by type
		for ( const snapshot of snapshots ) {
			const { type } = snapshot;
			let snapshotGroup = snapshotsByType.get( type );
			if ( !snapshotGroup ) {
				snapshotGroup = [];
				snapshotsByType.set( type, snapshotGroup );
			}
			snapshotGroup.push( snapshot );
		}

		// build request groups
		const groups = [];
		for ( const [ type, snapshotGroup ] of snapshotsByType ) {
			const adapter = store.adapterFor( type.modelName );
			const {
				maxURLLength,
				findIdParam,
				findIdMax,
				findIdSeparator
			} = adapter;

			const baseLength = adapter._buildURL( type ).length;
			const paramName = findIdParam || store.serializerFor( type.modelName ).primaryKey;
			const paramNameLength = paramName.length;
			const findIdSeparatorLength = findIdSeparator?.length || 0;

			let group = [];
			let length = baseLength;

			for ( const snapshot of snapshotGroup ) {
				length += group.length === 0 || findIdSeparatorLength === 0
					// ${url}?${paramName}=${id1} ... &${paramName}=${id2}
					? 2 + paramNameLength
					// ${url}?${paramName}=${id1} ... ${findIdSeparator}${id2}
					: findIdSeparatorLength;
				length += String( snapshot.record.id ).length;

				if ( length <= maxURLLength && group.length < findIdMax ) {
					group.push( snapshot );
				} else {
					groups.push( group );
					group = [ snapshot ];
					length = baseLength;
				}
			}

			if ( group.length ) {
				groups.push( group );
			}
		}

		return groups;
	}
});
