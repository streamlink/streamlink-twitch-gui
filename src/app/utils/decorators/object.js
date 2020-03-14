/**
 * Property decorator:
 * Sets/overrides a property descriptor on the class's prototype.
 * @param {PropertyDescriptor} descriptor
 * @returns {function(): PropertyDescriptor}
 */
export function descriptor( descriptor ) {
	return () => descriptor;
}


/**
 * Class decorator:
 * Sets a class's name
 * @param {string} name
 * @returns {function(Object): undefined}
 */
export function name( name ) {
	return cls => {
		cls.toString = () => name;
	};
}
