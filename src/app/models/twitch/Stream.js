import {
	get,
	computed
} from "@ember/object";
import { and } from "@ember/object/computed";
import {
	inject as service
} from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import Moment from "moment";
import { DEFAULT_VODCAST_REGEXP } from "models/localstorage/Settings/streams";


/**
 * @typedef {Object} FPSRange
 * @property {Number} target
 * @property {Number} min
 * @property {Number} max
 */

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


export default Model.extend({
	average_fps: attr( "number" ),
	broadcast_platform: attr( "string" ),
	channel: belongsTo( "twitchChannel", { async: false } ),
	//community_id: attr( "number" ),
	created_at: attr( "date" ),
	delay: attr( "number" ),
	game: attr( "string" ),
	//is_playlist: attr( "boolean" ),
	preview: belongsTo( "twitchImage", { async: false } ),
	stream_type: attr( "string" ),
	video_height: attr( "number" ),
	viewers: attr( "number" ),


	settings: service(),


	reVodcast: computed( "settings.streams.vodcast_regexp", function() {
		const vodcast_regexp = get( this, "settings.streams.vodcast_regexp" );
		if ( vodcast_regexp.length && !vodcast_regexp.trim().length ) {
			return null;
		}
		try {
			return new RegExp( vodcast_regexp || DEFAULT_VODCAST_REGEXP, "i" );
		} catch ( e ) {
			return null;
		}
	}),

	// both properties are not documented in the v5 API
	isVodcast: computed(
		"broadcast_platform",
		"stream_type",
		"reVodcast",
		"channel.status",
		function() {
			if (
				   get( this, "broadcast_platform" ) === "watch_party"
				|| get( this, "stream_type" ) === "watch_party"
			) {
				return true;
			}

			const reVodcast = get( this, "reVodcast" );
			const status = get( this, "channel.status" );

			return reVodcast && status
				? reVodcast.test( status )
				: false;
		}
	),


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
