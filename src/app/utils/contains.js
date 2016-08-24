/**
 * @this {Array}
 * @param {...*} arguments
 * @returns {boolean}
 */
export function all() {
	for ( var i = 0, l = arguments.length; i < l; i++ ) {
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
	for ( var i = 0, l = arguments.length; i < l; i++ ) {
		if ( this.indexOf( arguments[ i ] ) >= 0 ) {
			return true;
		}
	}
	return false;
}
