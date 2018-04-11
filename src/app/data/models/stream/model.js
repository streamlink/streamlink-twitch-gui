import { get, set, computed, observer } from "@ember/object";
import { alias, not } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { twitch as twitchConfig } from "config";
import qualitiesStreamlink from "./-qualities/streamlink";
import qualitiesLivestreamer from "./-qualities/livestreamer";


const {
	"stream-url": twitchStreamUrl,
	oauth: {
		"client-id": clientId
	}
} = twitchConfig;


const STATUS_PREPARING = 0;
const STATUS_ABORTED = 1;
const STATUS_LAUNCHING = 2;
const STATUS_WATCHING = 3;
const STATUS_COMPLETED = 4;


const createPresetObj = ( presets, preset ) => {
	presets[ preset.id ] = preset;
	return presets;
};
const qualitiesByIdStreamlink = qualitiesStreamlink.reduce( createPresetObj, {} );
const qualitiesByIdLivestreamer = qualitiesLivestreamer.reduce( createPresetObj, {} );


function computedStatus( status ) {
	return computed( "status", {
		get() {
			return get( this, "status" ) === status;
		},
		set( value ) {
			if ( value ) {
				set( this, "status", status );
				return true;
			}
		}
	});
}


export {
	qualitiesStreamlink as qualities,
	qualitiesStreamlink,
	qualitiesLivestreamer
};


/**
 * @class Stream
 */
export default Model.extend({
	/** @property {TwitchStream} stream */
	stream: belongsTo( "twitchStream", { async: false } ),
	/** @property {TwitchChannel} channel */
	channel: belongsTo( "twitchChannel", { async: false } ),
	quality: attr( "string" ),
	chat_open: attr( "boolean" ),
	started: attr( "date" ),


	// let Streamlink/Livestreamer use the GUI's client-id
	clientID: `Client-ID=${clientId}`,

	// passthrough type (twitch streams are HLS)
	playerInputPassthrough: "hls",

	/** @property {String} status */
	status: STATUS_PREPARING,

	/** @property {ChildProcess} spawn */
	spawn: null,

	/** @property {Error} error */
	error: null,
	warning: false,

	/** @property {Object[]} log */
	log: null,
	showLog: false,


	auth: service(),
	settings: service(),
	streaming: service(),


	session: alias( "auth.session" ),


	isPreparing: computedStatus( STATUS_PREPARING ),
	isAborted: computedStatus( STATUS_ABORTED ),
	isLaunching: computedStatus( STATUS_LAUNCHING ),
	isWatching: computedStatus( STATUS_WATCHING ),
	isCompleted: computedStatus( STATUS_COMPLETED ),

	hasEnded: computed( "status", "error", function() {
		const status = get( this, "status" );
		const error = get( this, "error" );

		return !!error || status === STATUS_ABORTED || status === STATUS_COMPLETED;
	}),


	isLivestreamer: not( "isStreamlink" ),
	isStreamlink: alias( "settings.streaming.isStreamlink" ),


	customParameters: computed(function() {
		const provider  = get( this, "settings.streaming.provider" );
		const providers = get( this, "settings.streaming.providers" );

		return get( providers, `${provider}.params` ) || "";
	}).volatile(),


	kill() {
		if ( this.spawn ) {
			this.spawn.kill( "SIGTERM" );
		}
	},

	pushLog( type, line ) {
		get( this, "log" ).pushObject({ type, line });
	},


	qualityObserver: observer( "quality", function() {
		// the StreamingService knows that it has to spawn a new child process
		this.kill();
	}),


	// get the default quality object of the selected quality and streaming provider
	streamQualityPreset: computed( "quality", "isStreamlink", function() {
		const quality = get( this, "quality" );
		const isStreamlink = get( this, "isStreamlink" );
		const qualities = isStreamlink
			? qualitiesByIdStreamlink
			: qualitiesByIdLivestreamer;

		return qualities[ quality ]
		    || qualities[ "source" ];
	}),

	// get the --stream-sorting-excludes parameter value (Streamlink)
	streamQualitiesExclude: computed(
		"streamQualityPreset",
		"settings.streaming.qualities",
		function() {
			const { id, exclude } = get( this, "streamQualityPreset" );
			const custom = get( this, "settings.streaming.qualities" ).toJSON();

			return custom.hasOwnProperty( id )
			    && String( custom[ id ][ "exclude" ] || "" ).trim().length > 0
				? custom[ id ][ "exclude" ]
				: exclude;
		}
	),

	// get the stream quality selection (for both Streamlink and Livestreamer)
	streamQuality: computed(
		"streamQualityPreset",
		"settings.streaming.qualities",
		"settings.streaming.qualitiesOld",
		"isStreamlink",
		function() {
			const { id, quality } = get( this, "streamQualityPreset" );

			if ( get( this, "isStreamlink" ) ) {
				const custom = get( this, "settings.streaming.qualities" ).toJSON();

				// get the quality attribute of the streamlink quality fragment
				return custom.hasOwnProperty( id )
				    && String( custom[ id ][ "quality" ] || "" ).trim().length > 0
					? custom[ id ][ "quality" ]
					: quality;

			} else {
				const custom = get( this, "settings.streaming.qualitiesOld" ).toJSON();

				// get the value of the livestreamer quality attribute
				return custom.hasOwnProperty( id )
				    && String( custom[ id ] || "" ).trim().length > 0
					? custom[ id ]
					: quality;
			}
		}
	),

	streamUrl: computed( "channel.name", function() {
		const channel = get( this, "channel.name" );

		return twitchStreamUrl.replace( "{channel}", channel );
	})

}).reopenClass({

	toString() { return "Stream"; }

});
