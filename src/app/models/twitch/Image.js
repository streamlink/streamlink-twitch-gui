import { get, computed } from "@ember/object";
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
 * @param {String} attr
 * @returns {Ember.ComputedProperty} Volatile computed property
 */
function buffered( attr ) {
	return computed(function() {
		let exp = this[ `expiration_${attr}` ];

		return exp
			? getURL( get( this, `image_${attr}` ), exp )
			: get( this, `${attr}Latest` );
	}).volatile();
}

/**
 * Return the image URL with an expiration parameter, so the latest version will be requested.
 * Update the expiration timer only once every X seconds.
 * @param {String} attr
 * @returns {Ember.ComputedProperty} Volatile computed property
 */
function latest( attr ) {
	// use a volatile property
	return computed(function() {
		const url = get( this, `image_${attr}` );

		// use the same timestamp for `time` seconds
		const key = `expiration_${attr}`;
		const now = Date.now();
		let exp = this[ key ];

		if ( !exp || exp <= now ) {
			exp = now + time;
			this[ key ] = exp;
		}

		return getURL( url, exp );
	}).volatile();
}


export default Model.extend({
	// original attributes (renamed)
	image_large: attr( "string" ),
	image_medium: attr( "string" ),
	image_small: attr( "string" ),

	// expiration times
	expiration_large: null,
	expiration_medium: null,
	expiration_small: null,

	// "request latest image version, but only every X seconds"
	// should be used by a route's model hook
	largeLatest: latest( "large" ),
	mediumLatest: latest( "medium" ),
	smallLatest: latest( "small" ),

	// "use the previous expiration parameter"
	// should be used by all image src attributes in the DOM
	large: buffered( "large" ),
	medium: buffered( "medium" ),
	small: buffered( "small" )
});
