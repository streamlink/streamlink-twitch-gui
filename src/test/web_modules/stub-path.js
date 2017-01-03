export const sep = "/";

/**
 * Don't resolve, just join nested paths
 * @param {...String}
 * @returns {String}
 */
export function resolve() {
	return [ ...arguments ]
		.reduce( ( arr, elem ) => {
			arr.push( ...( elem.split( sep ) ) );
			return arr;
		}, [] )
		.join( sep );
}
