import {
	get,
	computed
} from "ember";
import {
	attr,
	belongsTo,
	Model
} from "ember-data";
import Moment from "moment";


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
	//community_id: attr( "number" ),
	created_at: attr( "date" ),
	delay: attr( "number" ),
	game: attr( "string" ),
	//is_playlist: attr( "boolean" ),
	preview: belongsTo( "twitchImage", { async: false } ),
	video_height: attr( "number" ),
	viewers: attr( "number" ),

	hasFormatInfo: and( "video_height", "average_fps" ),


	titleCreatedAt: computed( "created_at", function() {
		const created_at = get( this, "created_at" );
		const moment = new Moment( created_at );
		const diff = moment.diff( new Date(), "days" );
		const formatted = moment.format( diff === 0 ? "LTS" : "llll" );

		return `Online since ${formatted}`;
	}),

	titleViewers: computed( "viewers", function() {
		const number = get( this, "viewers" );
		const text = number === 1
			? " person is watching"
			: " people are watching";

		return `${number}${text}`;
	}),

	resolution: computed( "video_height", function() {
		// assume 16:9
		const video_height = get( this, "video_height" );
		const width = Math.round( ( 16 / 9 ) * video_height );
		const height = Math.round( video_height );

		return `${width}x${height}`;
	}),

	fps: computed( "average_fps", function() {
		const average_fps = get( this, "average_fps" );

		if ( !average_fps ) { return null; }

		const fpsRange = fpsRanges.find( fpsRange =>
			   average_fps > fpsRange.min
			&& average_fps <= fpsRange.max
		);

		return fpsRange
			? fpsRange.target
			: Math.floor( average_fps );
	})

}).reopenClass({
	toString() { return "kraken/streams"; }
});
