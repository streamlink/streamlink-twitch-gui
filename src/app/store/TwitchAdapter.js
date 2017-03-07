import {
	get,
	isNone,
	inject,
	observer
} from "Ember";
import { RESTAdapter } from "EmberData";
import { twitch } from "config";
import AdapterMixin from "store/AdapterMixin";


const { service } = inject;
const { oauth: { "client-id": clientId } } = twitch;

const reURLFragment = /^:(.+)$/;


export default RESTAdapter.extend( AdapterMixin, {
	auth: service(),

	host: "https://api.twitch.tv",
	namespace: "",
	headers: {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": clientId
	},

	defaultSerializer: "twitch",


	coalesceFindRequests: false,

	findManyIdString: null,
	findManyIdSeparator: ",",


	access_token: null,
	tokenObserver: observer( "access_token", function() {
		var token = get( this, "access_token" );
		if ( token === null ) {
			delete this.headers[ "Authorization" ];
		} else {
			this.headers[ "Authorization" ] = `OAuth ${token}`;
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

	findMany( store, type, ids, snapshots ) {
		const url = this.buildURL( type, null, snapshots, "findMany" );
		const data = {
			[ this.findManyIdString ]: ids.join( this.findManyIdSeparator )
		};

		return this.ajax( url, "GET", { data } );
	},


	/**
	 * Dynamic URL fragments
	 * @param {DS.Model} type
	 * @param {string?} id
	 * @returns {string[]}
	 */
	buildURLFragments( type, id ) {
		var adapter = this;
		var idFound = false;

		var path = type.toString();
		var url  = path.split( "/" );

		url = url.map(function( frag ) {
			return frag.replace( reURLFragment, function( _, key ) {
				switch ( key ) {
					case "id":
						if ( isNone( id ) ) { throw new Error( "Unknown ID" ); }
						idFound = true;
						return id;
					// a user_{id,name} fragment requires the user to be logged in
					case "user_id":
					case "user_name":
						let user = get( adapter, `auth.session.${key}` );
						if ( !user ) { throw new Error( `Unknown ${key}` ); }
						return user;
					// unknown fragment
					default:
						throw new Error( `Unknown URL fragment: ${key}` );
				}
			});
		});

		if ( !idFound && !isNone( id ) ) {
			url.push( id );
		}

		return url;
	},


	groupRecordsForFindMany( store, snapshots ) {
		const snapshotsByType = new Map();

		// group snapshots by type
		snapshots.forEach( snapshot => {
			const type = snapshot.type;
			const typeArray = snapshotsByType.get( type ) || [];
			typeArray.push( snapshot );
			snapshotsByType.set( type, typeArray );
		});

		// build request groups
		const groups = [];
		snapshotsByType.forEach( ( snapshotGroup, type ) => {
			const adapter = store.adapterFor( type.modelName );

			const baseLength = adapter._buildURL( type ).length
				// "?[findManyIdString]="
				+ 2 + adapter.findManyIdString.length;
			const findManyIdSeparatorLength = adapter.findManyIdSeparator.length;
			const maxLength = adapter.maxURLLength;

			let group = [];
			let length = baseLength;

			snapshotGroup.forEach( snapshot => {
				const id = get( snapshot, "record.id" );
				const idLength = String( id ).length;
				const separatorLength = group.length === 0 ? 0 : findManyIdSeparatorLength;
				const newLength = length + separatorLength + idLength;

				if ( newLength <= maxLength ) {
					group.push( snapshot );
					length = newLength;
				} else {
					groups.push( group );
					group = [ snapshot ];
					length = baseLength;
				}
			});

			if ( group.length ) {
				groups.push( group );
			}
		});

		return groups;
	}
});
