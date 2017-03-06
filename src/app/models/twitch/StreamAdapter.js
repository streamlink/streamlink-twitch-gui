import { get } from "Ember";
import TwitchAdapter from "store/TwitchAdapter";


const queryStringLength = "?channel=".length;


export default TwitchAdapter.extend({
	coalesceFindRequests: true,

	findMany( store, type, ids, snapshots ) {
		const url = this.buildURL( type, ids, snapshots, "findMany" );

		return this.ajax( url, "GET", { data: { channel: ids.join( "," ) } } );
	},

	groupRecordsForFindMany( store, snapshots ) {
		const baseLength = this._buildURL( snapshots[0].type ).length + queryStringLength;
		const maxLength = this.maxURLLength;
		const groups = [];
		let group = [];
		let length = baseLength;

		snapshots.forEach( snapshot => {
			const id = get( snapshot, "record.id" );
			const idLength = String( id ).length;
			const comma = group.length === 0 ? 0 : 1;
			const newLength = length + comma + idLength;

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

		return groups;
	}
});
