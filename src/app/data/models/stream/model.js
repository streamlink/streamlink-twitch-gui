import { get, set, computed, observer } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { twitch as twitchConfig } from "config";
import qualities from "./-qualities";


const { "stream-url": twitchStreamUrl } = twitchConfig;


const STATUS_PREPARING = 0;
const STATUS_ABORTED = 1;
const STATUS_LAUNCHING = 2;
const STATUS_WATCHING = 3;
const STATUS_COMPLETED = 4;


const qualitiesById = qualities.reduce( ( presets, preset ) => {
	presets[ preset.id ] = preset;
	return presets;
}, {} );


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

function cpQualityFromPresetOrCustomValue( key ) {
	/** @this {Stream} */
	return function() {
		const { id, [ key ]: defaultValue } = this.streamQualityPreset;
		const custom = this.settings.content.streaming.qualities.toJSON();

		if ( custom.hasOwnProperty( id ) ) {
			const customValue = String( custom[ id ][ key ] || "" ).trim();
			if ( customValue.length ) {
				return customValue;
			}
		}

		return defaultValue;
	};
}


// TODO: refactor this module / export
export {
	qualities
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
	streamQualityPreset: computed( "quality", function() {
		const quality = get( this, "quality" );

		return qualitiesById[ quality ]
		    || qualitiesById[ "source" ];
	}),

	// get the --stream-sorting-excludes parameter value
	streamQualitiesExclude: computed(
		"streamQualityPreset",
		"settings.content.streaming.qualities",
		cpQualityFromPresetOrCustomValue( "exclude" )
	),

	// get the stream quality selection
	streamQuality: computed(
		"streamQualityPreset",
		"settings.content.streaming.qualities",
		cpQualityFromPresetOrCustomValue( "quality" )
	),

	streamUrl: computed( "channel.name", function() {
		const channel = get( this, "channel.name" );

		return twitchStreamUrl.replace( "{channel}", channel );
	})

}).reopenClass({

	toString() { return "Stream"; }

});
