import { get, set } from "@ember/object";


function factory( fn ) {
	/**
	 * @param {Enumerable} enumerable
	 * @param {...*} args
	 * @returns {Array}
	 */
	return function( enumerable, ...args ) {
		const meta = get( enumerable, "meta" );

		enumerable = enumerable[ fn ]( ...args );

		if ( meta ) {
			set( enumerable, "meta", meta );
		}

		return enumerable;
	};
}


export const toArray = factory( "toArray" );
export const mapBy = factory( "mapBy" );
