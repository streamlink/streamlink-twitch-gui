import { set, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { observes } from "@ember-decorators/object";
import { twitch as twitchConfig } from "config";
import qualities from "./-qualities";
import { name } from "utils/decorators";


const { "stream-url": twitchStreamUrl } = twitchConfig;


const STATUS_PREPARING = 0;
const STATUS_ABORTED = 1;
const STATUS_LAUNCHING = 2;
const STATUS_WATCHING = 3;
const STATUS_COMPLETED = 4;


const { hasOwnProperty } = {};

const qualitiesById = qualities.reduce( ( presets, preset ) => {
	presets[ preset.id ] = preset;
	return presets;
}, {} );

const computedStatus = status => computed( "status", {
	get() {
		return this.status === status;
	},
	set( value ) {
		if ( value ) {
			set( this, "status", status );
			return true;
		}
	}
});

function cpQualityFromPresetOrCustomValue( key ) {
	/** @this {Stream} */
	return computed( "streamQualityPreset", "settings.content.streaming.qualities", function() {
		const { id, [ key ]: defaultValue } = this.streamQualityPreset;
		const custom = this.settings.content.streaming.qualities.toJSON();

		if ( hasOwnProperty.call( custom, id ) ) {
			const customValue = String( custom[ id ][ key ] || "" ).trim();
			if ( customValue.length ) {
				return customValue;
			}
		}

		return defaultValue;
	});
}


// TODO: refactor this module / export
export {
	qualities
};


@name( "Stream" )
export default class Stream extends Model {
	/** @type {AuthService} */
	@service auth;
	/** @type {SettingsService} */
	@service settings;
	/** @type {StreamingService} */
	@service streaming;

	/** @type {TwitchStream} */
	@belongsTo( "twitch-stream", { async: false } )
	stream;
	/** @type {TwitchChannel} */
	@belongsTo( "twitch-channel", { async: false } )
	channel;
	@attr( "string" )
	quality;
	@attr( "boolean" )
	low_latency;
	@attr( "boolean" )
	disable_ads;
	@attr( "boolean" )
	chat_open;
	@attr( "date" )
	started;


	// passthrough type (twitch streams are HLS)
	playerInputPassthrough = "hls";

	/** @type {boolean} */
	strictQuality = false;

	/** @type {number} */
	status = STATUS_PREPARING;

	/** @type {ChildProcess} */
	spawn = null;

	/** @type {Error} */
	error = null;
	warning = false;

	/** @type {Object[]} */
	log = null;
	showLog = false;

	/** @type {Auth} */
	@alias( "auth.session" )
	session;


	@computedStatus( STATUS_PREPARING )
	isPreparing;
	@computedStatus( STATUS_ABORTED )
	isAborted;
	@computedStatus( STATUS_LAUNCHING )
	isLaunching;
	@computedStatus( STATUS_WATCHING )
	isWatching;
	@computedStatus( STATUS_COMPLETED )
	isCompleted;

	@computed( "status", "error" )
	get hasEnded() {
		return !!this.error
		    || this.status === STATUS_ABORTED
		    || this.status === STATUS_COMPLETED;
	}


	get customParameters() {
		const { provider, providers } = this.settings.content.streaming;

		return hasOwnProperty.call( providers, provider )
			? providers[ provider ].params || ""
			: "";
	}


	kill() {
		if ( this.spawn ) {
			this.spawn.kill( "SIGTERM" );
		}
	}

	pushLog( type, line ) {
		this.log.pushObject({ type, line });
	}


	@observes( "quality" )
	qualityObserver() {
		// the StreamingService knows that it has to spawn a new child process
		this.kill();
	}


	// get the default quality object of the selected quality and streaming provider
	@computed( "quality" )
	get streamQualityPreset() {
		return qualitiesById[ this.quality ]
		    || qualitiesById[ "source" ];
	}

	// get the --stream-sorting-excludes parameter value
	@cpQualityFromPresetOrCustomValue( "exclude" )
	streamQualitiesExclude;

	// get the stream quality selection
	@cpQualityFromPresetOrCustomValue( "quality" )
	streamQuality;

	@computed( "channel.name" )
	get streamUrl() {
		return twitchStreamUrl.replace( "{channel}", this.channel.name );
	}
}
