import {
	get,
	set,
	computed,
	inject,
	observer
} from "Ember";
import {
	attr,
	belongsTo,
	PromiseObject,
	Model
} from "EmberData";
import {
	streamprovider as streamproviderConfig,
	twitch as twitchConfig
} from "config";
import { parameters } from "./parameters";
import {
	getPlayerExec,
	getPlayerParams
} from "./playerparameters";
import {
	qualitiesByIdLivestreamer,
	qualitiesByIdStreamlink
} from "models/stream/qualities";
import Parameter from "utils/parameters/Parameter";


const { alias, not } = computed;
const { service } = inject;
const { providers } = streamproviderConfig;
const {
	"stream-url": twitchStreamUrl,
	oauth: {
		"client-id": clientId
	}
} = twitchConfig;


/**
 * @class Stream
 */
export default Model.extend({
	/** @property {TwitchStream} stream */
	stream      : belongsTo( "twitchStream", { async: false } ),
	/** @property {TwitchChannel} channel */
	channel     : belongsTo( "twitchChannel", { async: false } ),
	quality     : attr( "string" ),
	gui_openchat: attr( "boolean" ),
	started     : attr( "date" ),


	/** @property {ChildProcess} spawn */
	spawn  : null,
	success: false,
	error  : false,
	warning: false,
	log    : null,
	showLog: false,


	auth    : service(),
	settings: service(),

	session: alias( "auth.session" ),


	isLivestreamer: not( "isStreamlink" ),
	isStreamlink: computed(function() {
		let streamprovider = get( this, "settings.streamprovider" );
		if ( !streamprovider || !providers.hasOwnProperty( streamprovider ) ) {
			throw new Error( "Invalid stream provider" );
		}

		return providers[ streamprovider ].type === "streamlink";
	}),


	customParameters: computed(function() {
		let streamprovider  = get( this, "settings.streamprovider" );
		let streamproviders = get( this, "settings.streamproviders" );

		return get( streamproviders, `${streamprovider}.params` ) || "";
	}),


	// let Streamlink/Livestreamer use the GUI's client-id
	clientID: `Client-ID=${clientId}`,


	kill() {
		var spawn = get( this, "spawn" );
		if ( spawn ) {
			spawn.kill( "SIGTERM" );
		}
	},

	clearLog() {
		return set( this, "log", [] );
	},

	pushLog( type, line ) {
		get( this, "log" ).pushObject({ type, line });
	},

	qualityObserver: observer( "quality", function() {
		// The StreamproviderService knows that it has to spawn a new child process
		this.kill();
	}),

	getParameters() {
		// wait for all parameter promises to resolve first
		return Promise.all([
			get( this, "playerExec.promise" )
		])
			.then( () => Parameter.getParameters( this, parameters ) );
	},

	playerExec: computed( "settings.player", "settings.player_preset", function() {
		return PromiseObject.create({
			promise: getPlayerExec( get( this, "settings" ) )
		});
	}),

	playerParams: computed( "settings.player", "settings.player_preset", function() {
		return getPlayerParams( get( this, "settings" ) );
	}),


	streamQualityPreset: computed( "quality", "isStreamlink", function() {
		const quality = get( this, "quality" );
		const isStreamlink = get( this, "isStreamlink" );
		const qualities = isStreamlink
			? qualitiesByIdStreamlink
			: qualitiesByIdLivestreamer;

		return qualities[ quality ]
		    || qualities[ "source" ];
	}),

	streamQualitiesExclude: computed( "streamQualityPreset", "settings.qualities", function() {
		const { id, exclude } = get( this, "streamQualityPreset" );
		const custom = get( this, "settings.qualities" );

		return custom.hasOwnProperty( id ) && custom[ id ].trim().length > 0
			? custom[ id ]
			: exclude;
	}),

	streamQuality: computed( "streamQualityPreset", "isStreamlink", function() {
		const { id, quality } = get( this, "streamQualityPreset" );

		if ( get( this, "isStreamlink" ) ) {
			return quality;

		} else {
			const custom = get( this, "settings.quality_presets" );

			return custom.hasOwnProperty( id ) && custom[ id ].trim().length > 0
				? custom[ id ]
				: quality;
		}
	}),

	streamUrl: computed( "channel.name", function() {
		const channel = get( this, "channel.name" );

		return twitchStreamUrl.replace( "{channel}", channel );
	})

}).reopenClass({

	toString() { return "Stream"; }

});
