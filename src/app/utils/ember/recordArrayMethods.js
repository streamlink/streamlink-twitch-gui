import {
	get,
	set
} from "Ember";


const slice = [].slice;


function factory( fn ) {
	return function() {
		let args = slice.call( arguments );

		return function( recordArray ) {
			let meta = get( recordArray, "meta" );

			recordArray = recordArray[ fn ]( ...args );

			if ( meta ) {
				set( recordArray, "meta", meta );
			}

			return recordArray;
		};
	};
}


export const toArray = factory( "toArray" );
export const mapBy = factory( "mapBy" );
