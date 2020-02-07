/**
 * Simple template string function for annotating translation strings
 * @param {string[]} strings
 * @param {*} expressions
 * @returns {string}
 */
export default function t( strings, ...expressions ) {
	if ( strings.length === 1 ) {
		return strings[0];
	}

	const res = [ strings[ 0 ] ];
	for ( let i = 0, l = strings.length - 1; i < l; ) {
		res.push( expressions[ i ], strings[ ++i ] );
	}

	return res.join( "" );
}
