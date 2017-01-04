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
import { parameters } from "./parameters";
import {
	getPlayerExec,
	getPlayerParams
} from "./playerparameters";
import qualities from "./qualities";
import Parameter from "utils/parameters/Parameter";
import {
	streamprovider,
	twitch
} from "config";


const { alias, not } = computed;
const { service } = inject;
const { providers } = streamprovider;
const { oauth: { "client-id": clientId } } = twitch;


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
			.then( Parameter.getParameters.bind( null, this, parameters ) );
	},

	playerExec: computed( "settings.player", "settings.player_preset", function() {
		return PromiseObject.create({
			promise: getPlayerExec( get( this, "settings" ) )
		});
	}),

	playerParams: computed( "settings.player", "settings.player_preset", function() {
		return getPlayerParams( get( this, "settings" ) );
	}),

	streamquality: computed( "quality", "settings.quality_presets", function() {
		let quality = get( this, "quality" );
		let custom = get( this, "settings.quality_presets" );

		// get custom quality list
		if ( custom.hasOwnProperty( quality ) && custom[ quality ].length > 0 ) {
			return custom[ quality ];
		}

		// get predefined quality list
		let preset = qualities.findBy( "id", quality );

		return preset
			? preset.value
			: qualities.findBy( "id", "source" ).value;
	})

}).reopenClass({

	toString() { return "Stream"; }

});
