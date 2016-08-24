/**
 * @this {Array}
 * @param {...*} arguments
 * @returns {boolean}
 */
function containsAll() {
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
function containsSome() {
	for ( var i = 0, l = arguments.length; i < l; i++ ) {
		if ( this.indexOf( arguments[ i ] ) >= 0 ) {
			return true;
		}
	}
	return false;
}


export default {
	all : containsAll,
	some: containsSome
};
