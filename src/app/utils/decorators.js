export function descriptor( descriptor ) {
	return () => descriptor;
}

export function urlFragments( fragments ) {
	return cls => {
		const parentClass = Object.getPrototypeOf( cls );
		const parentFragments = parentClass.urlFragments || {};
		cls.urlFragments = Object.assign( {}, parentFragments, fragments );
	};
}
