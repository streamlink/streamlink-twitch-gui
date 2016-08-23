import {
	get,
	computed
} from "Ember";
import {
	attr,
	belongsTo,
	Model
} from "EmberData";
import Moment from "Moment";


const { and } = computed;

/**
 * Try to fix the weird fps numbers received from twitch...
 * Define a list of common stream frame rates and give each one a min and max value range.
 * @type {FPSRange[]}
 */
const fpsRanges = [
	{ target: 24, min: 22, max: 24.5 },
	{ target: 25, min: 24.5, max: 27 },
	{ target: 30, min: 28, max: 32 },
	{ target: 45, min: 43, max: 46.5 },
	{ target: 48, min: 46.5, max: 49.5 },
	{ target: 50, min: 49.5, max: 52 },
	{ target: 60, min: 58, max: 62.5 },
	{ target: 72, min: 70, max: 74 },
	{ target: 90, min: 88, max: 92 },
	{ target: 100, min: 98, max: 102 },
	{ target: 120, min: 118, max: 122 },
	{ target: 144, min: 142, max: 146 }
];

/**
 * @typedef {Object} FPSRange
 * @property {Number} target
 * @property {Number} min
 * @property {Number} max
 */


export default Model.extend({
	average_fps: attr( "number" ),
	channel: belongsTo( "twitchChannel", { async: false } ),
	created_at: attr( "date" ),
	game: attr( "string" ),
	preview: belongsTo( "twitchImage", { async: false } ),
	video_height: attr( "number" ),
	viewers: attr( "number" ),

	hasFormatInfo: and( "video_height", "average_fps" ),


	title_created_at: function() {
		var created_at = get( this, "created_at" );
		var moment     = new Moment( created_at );
		var diff       = moment.diff( new Date(), "days" );
		var formatted  = moment.format( diff === 0 ? "LTS" : "llll" );
		return "Online since " + formatted;
	}.property( "created_at" ),

	title_viewers: function() {
		var viewers = get( this, "viewers" );
		var numerus = viewers === 1 ? " person is watching" : " people are watching";
		return viewers + numerus;
	}.property( "viewers" ),

	resolution: function() {
		// assume 16:9
		var video_height = get( this, "video_height" );
		var width  = Math.round( ( 16 / 9 ) * video_height );
		var height = Math.round( video_height );
		return width + "x" + height;
	}.property( "video_height" ),

	fps: function() {
		var average_fps = get( this, "average_fps" );

		if ( !average_fps ) { return null; }

		var fpsRange = fpsRanges.find(function( fpsRange ) {
			return average_fps >  fpsRange.min
			    && average_fps <= fpsRange.max;
		});

		return fpsRange
			? fpsRange.target
			: Math.floor( average_fps );
	}.property( "average_fps" )

}).reopenClass({
	toString: function() { return "kraken/streams"; }
});
