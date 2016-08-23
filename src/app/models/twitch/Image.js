import {
	get,
	computed
} from "Ember";
import {
	attr,
	Model
} from "EmberData";
import { vars } from "config";


const { "image-expiration-time": time } = vars;


function getURL( url, time ) {
	return url + "?_=" + time;
}

/**
 * Return the image URL with an already set expiration time.
 * Or create a new expiration time if it hasn't been set yet.
 * @param {String} attr
 * @returns {Ember.ComputedProperty} Volatile computed property
 */
function buffered( attr ) {
	return computed(function() {
		var exp = this[ attr + "_expiration" ];

		return exp
			? getURL( get( this, attr + "_image" ), exp )
			: get( this, attr + "_nocache" );
	}).volatile();
}

/**
 * Return the image URL with an expiration parameter, so the latest version will be requested.
 * Update the expiration timer only once every X seconds.
 * @param {String} attr
 * @returns {Ember.ComputedProperty} Volatile computed property
 */
function nocache( attr ) {
	// use a volatile property
	return computed(function() {
		var url = get( this, attr + "_image" );

		// use the same timestamp for `time` seconds
		var key = attr + "_expiration";
		var exp = this[ key ];
		var now = +new Date();
		if ( !exp || exp < now ) {
			this[ key ] = exp = now + time;
		}

		return getURL( url, exp );
	}).volatile();
}


export default Model.extend({
	// original attributes (renamed)
	large_image : attr( "string" ),
	medium_image: attr( "string" ),
	small_image : attr( "string" ),

	// "request latest image version, but only every X seconds"
	// should be used by the model hook of all routes
	large_nocache : nocache( "large" ),
	medium_nocache: nocache( "medium" ),
	small_nocache : nocache( "small" ),

	// "use the previous expiration parameter"
	// should be used for all image src attributes in the DOM
	large : buffered( "large" ),
	medium: buffered( "medium" ),
	small : buffered( "small" )
});
