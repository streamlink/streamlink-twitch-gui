import { computed } from "@ember/object";
import { and } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import Moment from "moment";
import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";
import { name } from "utils/decorators";


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

const reRerun = /rerun|watch_party/;


@name( "kraken/streams" )
export default class TwitchStream extends Model {
	/** @type {I18nService} */
	@service i18n;
	/** @type {SettingsService} */
	@service settings;


	@attr( "number" )
	average_fps;
	@attr( "string" )
	broadcast_platform;
	/** @type {TwitchChannel} */
	@belongsTo( "twitch-channel", { async: false } )
	channel;
	@attr( "date" )
	created_at;
	@attr( "number" )
	delay;
	@attr( "string" )
	game;
	//@attr( "boolean" )
	//is_playlist;
	/** @type {TwitchImage} */
	@belongsTo( "twitch-image", { async: false } )
	preview;
	@attr( "string" )
	stream_type;
	@attr( "number" )
	video_height;
	@attr( "number" )
	viewers;


	@computed( "settings.content.streams.vodcast_regexp" )
	get reVodcast() {
		const vodcast_regexp = this.settings.content.streams.vodcast_regexp;
		if ( vodcast_regexp.length && !vodcast_regexp.trim().length ) {
			return null;
		}
		try {
			return new RegExp( vodcast_regexp || DEFAULT_VODCAST_REGEXP, "i" );
		} catch ( e ) {
			return null;
		}
	}

	// both properties are not documented in the v5 API
	@computed(
		"broadcast_platform",
		"stream_type",
		"reVodcast",
		"channel.status"
	)
	get isVodcast() {
		if (
			   reRerun.test( this.broadcast_platform )
			|| reRerun.test( this.stream_type )
		) {
			return true;
		}

		const reVodcast = this.reVodcast;
		const status = this.channel.status;

		return reVodcast && status
			? reVodcast.test( status )
			: false;
	}


	@and( "video_height", "average_fps" )
	hasFormatInfo;


	@computed( "i18n.locale", "created_at" )
	get titleCreatedAt() {
		const moment = new Moment( this.created_at );
		const last24h = moment.diff( new Date(), "days" ) === 0;
		const format = last24h
			? this.i18n.t( "models.twitch.stream.created-at.less-than-24h" )
			: this.i18n.t( "models.twitch.stream.created-at.more-than-24h" );

		return moment.format( format.toString() );
	}

	@computed( "i18n.locale", "viewers" )
	get titleViewers() {
		return this.i18n.t( "models.twitch.stream.viewers", { count: this.viewers } );
	}

	@computed( "video_height" )
	get resolution() {
		// assume 16:9
		const video_height = this.video_height;
		const width = Math.round( ( 16 / 9 ) * video_height );
		const height = Math.round( video_height );

		return `${width}x${height}`;
	}

	@computed( "average_fps" )
	get fps() {
		const average_fps = this.average_fps;
		if ( !average_fps ) { return null; }

		const fpsRange = fpsRanges.find( fpsRange =>
			   average_fps > fpsRange.min
			&& average_fps <= fpsRange.max
		);

		return fpsRange
			? fpsRange.target
			: Math.floor( average_fps );
	}
}
