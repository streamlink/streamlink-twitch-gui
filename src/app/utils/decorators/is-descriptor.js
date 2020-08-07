export function isDescriptor( target, key, desc ) {
	return arguments.length === 3
	    && typeof target === "object"
	    && target !== null
	    && typeof key === "string"
	    && typeof desc === "object"
	    && desc !== null
	    && "enumerable" in desc
	    && "configurable" in desc;
}
