import { get, set } from "@ember/object";


function factory( fn ) {
	/**
	 * @param {(DS.RecordArray|Ember.MutableArray)} enumerable
	 * @param {...*} args
	 * @returns {Promise<Ember.MutableArray>}
	 */
	return async function( arr, ...args ) {
		const meta = get( arr, "meta" );

		arr = await Promise.all( arr[ fn ]( ...args ) );
		arr = arr.filter( Boolean );

		/* istanbul ignore else */
		if ( meta ) {
			set( arr, "meta", meta );
		}

		return arr;
	};
}


export const toArray = factory( "toArray" );
export const map = factory( "map" );
