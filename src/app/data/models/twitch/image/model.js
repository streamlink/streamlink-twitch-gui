import attr from "ember-data/attr";
import Model from "ember-data/model";
import { vars } from "config";


const { "image-expiration-time": time } = vars;


function getURL( url, time ) {
	return `${url}?_=${time}`;
}

/**
 * Return the image URL with an already set expiration time.
 * Or create a new expiration time if it hasn't been set yet.
 * @param {string} attr
 * @returns {function(): PropertyDescriptor}
 */
const buffered = attr => () => ({
	get() {
		const exp = this[ `expiration_${attr}` ];

		return exp
			? getURL( this[ `image_${attr}` ], exp )
			: this[ `${attr}Latest` ];
	}
});

/**
 * Return the image URL with an expiration parameter, so the latest version will be requested.
 * Update the expiration timer only once every X seconds.
 * @param {string} attr
 * @returns {function(): PropertyDescriptor}
 */
const latest = attr => () => ({
	get() {
		const url = this[ `image_${attr}` ];

		// use the same timestamp for `time` seconds
		const key = `expiration_${attr}`;
		const now = Date.now();
		let exp = this[ key ];

		if ( !exp || exp <= now ) {
			exp = now + time;
			this[ key ] = exp;
		}

		return getURL( url, exp );
	}
});


export default class TwitchImage extends Model {
	// original attributes (renamed)
	@attr( "string" )
	image_large;
	@attr( "string" )
	image_medium;
	@attr( "string" )
	image_small;

	// expiration times
	expiration_large = null;
	expiration_medium = null;
	expiration_small = null;

	// "request latest image version, but only every X seconds"
	// should be used by a route's model hook
	@latest( "large" )
	largeLatest;
	@latest( "medium" )
	mediumLatest;
	@latest( "small" )
	smallLatest;

	// "use the previous expiration parameter"
	// should be used by all image src attributes in the DOM
	@buffered( "large" )
	large;
	@buffered( "medium" )
	medium;
	@buffered( "small" )
	small;
}
