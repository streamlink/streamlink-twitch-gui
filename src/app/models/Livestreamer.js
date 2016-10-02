import {
	get,
	set,
	computed,
	inject
} from "Ember";
import {
	attr,
	belongsTo,
	Model
} from "EmberData";
import { parameters } from "models/LivestreamerParameters";
import qualities from "models/LivestreamerQualities";
import Parameter from "utils/Parameter";
import { twitch } from "config";


const { alias } = computed;
const { service } = inject;
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

	qualityObserver: function() {
		// The LivestreamerService knows that it has to spawn a new child process
		this.kill();
	}.observes( "quality" ),

	parameters: function() {
		return Parameter.getParameters(
			this,
			parameters,
			get( this, "settings.advanced" )
		);
	}.property().volatile(),

	streamquality: function() {
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
	}.property( "quality", "settings.quality_presets" )

}).reopenClass({

	toString() { return "Livestreamer"; }

});
