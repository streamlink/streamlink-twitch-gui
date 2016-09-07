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
import Parameter from "utils/Parameter";


const { alias } = computed;
const { service } = inject;


/**
 * @class Livestreamer
 */
export default Model.extend({
	stream      : belongsTo( "twitchStream", { async: false } ),
	channel     : belongsTo( "twitchChannel", { async: false } ),
	quality     : attr( "number" ),
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
	}.property().volatile()

}).reopenClass({

	toString() { return "Livestreamer"; }

});
