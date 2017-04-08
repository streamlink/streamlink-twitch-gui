/**
 * @this {Array}
 * @param {...*} arguments
 * @returns {boolean}
 */
export function all() {
	const l = arguments.length;

	for ( let i = 0; i < l; i++ ) {
		if ( this.indexOf( arguments[ i ] ) < 0 ) {
			return false;
		}
	}
	return true;
}

/**
 * @this {Array}
 * @param {...*} arguments
 * @returns {boolean}
 */
export function some() {
	const l = arguments.length;

	for ( let i = 0; i < l; i++ ) {
		if ( this.indexOf( arguments[ i ] ) >= 0 ) {
			return true;
		}
	}
	return false;
}
