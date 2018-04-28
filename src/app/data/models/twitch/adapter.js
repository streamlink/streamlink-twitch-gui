import { get, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import RESTAdapter from "ember-data/adapters/rest";
import { twitch } from "config";
import AdapterMixin from "data/models/-mixins/adapter";


const { oauth: { "client-id": clientId } } = twitch;


export default RESTAdapter.extend( AdapterMixin, {
	auth: service(),

	host: "https://api.twitch.tv",
	namespace: "",
	headers: {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": clientId
	},

	defaultSerializer: "twitch",


	urlFragments: {
		user_id() {
			let user_id = get( this, "auth.session.user_id" );
			if ( !user_id ) {
				throw new Error( "Unknown user_id" );
			}

			return user_id;
		},
		user_name() {
			let user_name = get( this, "auth.session.user_name" );
			if ( !user_name ) {
				throw new Error( "Unknown user_name" );
			}

			return user_name;
		}
	},


	coalesceFindRequests: false,

	findManyIdString: null,
	findManyIdSeparator: ",",


	access_token: null,
	tokenObserver: observer( "access_token", function() {
		const token = get( this, "access_token" );
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
