"use strict";

// https://github.com/webpack/webpack/pull/9349
module.exports = function loadJsonModule( source ) {
	if ( typeof source !== "string" ) {
		throw new Error( `Unexpected source type: ${typeof source}` );
	}

	this.cacheable();

	// source can be the result of another loader exporting JSON as a commonJS module
	source = source.replace( /^module.exports\s*=\s*|;$/g, "" );

	const object = JSON.parse( source );
	const jsonSource = JSON.stringify( object );

	// cf. https://v8.dev/blog/cost-of-javascript-2019
	// > As long as the JSON string is only evaluated once, the JSON.parse approach is
	// > much faster compared to the JavaScript object literal, especially for cold loads.
	return `module.exports = JSON.parse(${JSON.stringify(jsonSource)});`;
};
