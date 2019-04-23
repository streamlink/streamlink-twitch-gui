import { fragment as modelFragment } from "ember-data-model-fragments/attributes";


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

export function name( name ) {
	return cls => {
		cls.toString = () => name;
	};
}

export function fragment( name, options = {}, ...params ) {
	return modelFragment(
		name,
		Object.assign( { defaultValue: {} }, options ),
		...params
	);
}
