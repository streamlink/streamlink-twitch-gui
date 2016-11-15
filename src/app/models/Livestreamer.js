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
import { parameters } from "models/LivestreamerParameters";
import {
	getPlayerExec,
	getPlayerParams
} from "models/LivestreamerPlayerParameters";
import qualities from "models/LivestreamerQualities";
import Parameter from "utils/Parameter";
import {
	streamprovider,
	twitch
} from "config";


const { alias, not } = computed;
const { service } = inject;
const { providers } = streamprovider;
const { oauth: { "client-id": clientId } } = twitch;


/**
 * @class Livestreamer
 */
export default Model.extend({
	stream      : belongsTo( "twitchStream", { async: false } ),
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
	isStreamlink: computed( "settings.content.streamprovider", function() {
		let streamprovider = get( this, "settings.content.streamprovider" );
		if ( !providers.hasOwnProperty( streamprovider ) ) {
			throw new Error( "Invalid stream provider" );
		}

		return providers[ streamprovider ].type === "streamlink";
	}),

	// let Livestreamer use the GUI's client-id
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
		// The LivestreamerService knows that it has to spawn a new child process
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

	toString() { return "Livestreamer"; }

});
