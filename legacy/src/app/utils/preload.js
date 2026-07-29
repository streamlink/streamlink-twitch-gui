import { makeArray } from "@ember/array";
import { get } from "@ember/object";
import { window as Window } from "nwjs/Window";


const { Image } = Window;


export async function preloadImage( url ) {
	if ( typeof url !== "string" || !url.length ) { return; }

	let image = new Image();

	try {
		await new Promise( resolve => {
			image.addEventListener( "load", resolve );
			image.addEventListener( "error", resolve );
			image.src = url;
		});
	} finally {
		image = null;
	}
}


/**
 * @param {Object|Array} data
 * @param {(string|string[])} paths
 * @returns {Promise}
 */
export async function preload( data, paths ) {
	const all = [];

	// data instanceof Ember.Enumerable
	const _data = data.toArray
		? data.toArray()
		: makeArray( data );

	paths = makeArray( paths );

	_data.forEach( obj => {
		const urls = paths.map( path => get( obj, path ) );
		all.push( ...urls );
	});

	await Promise.all( all.map( preloadImage ) );

	return data;
}


export default preload;
