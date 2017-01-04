// Using a simple custom implementation for comparing semantic version strings

const reSemVer = /^\s*v?(\d+\.\d+\.\d+)(?:-([a-z\d.]+))?(?:\+([a-z\d.]+))?\s*$/i;


function castToNumber( val ) {
	const num = Number( val );

	return isNaN( num ) ? val : num;
}


/**
 * Split a matching semantic version string into a nested array of tokens
 * @param {string} value
 * @returns {Array|undefined}
 */
export function tokenize( value ) {
	const m = String( value ).match( reSemVer );
	if ( !m ) { return undefined; }

	return [
		m[1].split( "." ).map( castToNumber ),
		m[2] ? m[2].split( "." ).map( castToNumber ) : undefined
		// semver.org: "Build metadata SHOULD be ignored when determining version precedence"
		//m[3] ? m[3].split( "." ).map( castToNumber ) : undefined
	];
}


/**
 * Compare function (Array.prototype.sort) for tokenized versions
 * @param {Array} left
 * @param {Array} right
 * @returns {number}
 */
export function compare( left, right ) {
	let typeL = !(  left instanceof Array );
	let typeR = !( right instanceof Array );

	// only compare two arrays!!!
	if ( typeL && typeR ) { return 0; }
	if ( typeL ) { return -1; }
	if ( typeR ) { return  1; }

	// compare each element
	let nL = left.length, nR = right.length;
	for ( let l, r, sub, i = 0; i < nL && i < nR; i++ ) {
		l = left[ i ];
		r = right[ i ];

		// does a token contain another list of subtokens?
		typeL = l instanceof Array;
		typeR = r instanceof Array;
		if ( typeL || typeR ) {
			if ( !typeL ) { return  1; }
			if ( !typeR ) { return -1; }
			// compare subtokenlist
			sub = compare( l, r );
			// go on if both subtokenlists are equal
			if ( sub !== 0 ) { return sub; }

		} else {
			// invalid or missing value comparison
			if ( l === undefined && r === undefined ) { continue; }
			if ( l === undefined ) { return  1; }
			if ( r === undefined ) { return -1; }

			// never compare numbers and strings
			typeL = !isNaN( l );
			typeR = !isNaN( r );
			if ( typeL || typeR ) {
				if ( !typeL ) { return  1; }
				if ( !typeR ) { return -1; }
				if ( l === r ) { continue; }
			}

			// compare values regularly
			if ( l > r ) { return  1; }
			if ( l < r ) { return -1; }
		}
	}

	// both equal to this point... compare remaining length
	return nL - nR;
}


/**
 * Prepare an array for sorting
 * @param {Object[]} list
 * @param {Function} [traverse]
 * @returns {Object[]}
 */
function prepare( list, traverse ) {
	traverse = traverse || ( elem => elem );

	return list.map( value => ({
		token: tokenize( traverse( value ) ),
		value
	}) );
}


/**
 * Get the highest version
 * @param {Object[]} list
 * @param {Function} [traverse]
 * @returns {Object} the record with the highest version string
 */
export function getMax( list, traverse ) {
	// tokenize once and save original value
	return prepare( list, traverse )
	// then return the original value of the maximum
		.reduce(function( max, current ) {
			return compare( max.token, current.token ) === 1
				? max
				: current;
		}).value;
}


/**
 * Sort an array of versions
 * @param {Object[]} list
 * @param {Function} [traverse]
 * @returns {Object[]} a new sorted array
 */
export function sort( list, traverse ) {
	// tokenize once and save original value
	return prepare( list, traverse )
		// then sort
		.sort( ( left, right ) => compare( left.token, right.token ) )
		// and finally return the original values
		.map( obj => obj.value );
}
