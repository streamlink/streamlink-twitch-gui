import {
	get,
	computed,
	inject,
	Controller
} from "ember";
import {
	players as playersConfig
} from "config";
import substitutionsPlayer from "services/StreamingService/player/substitutions";
import { platform } from "utils/node/platform";
import { delimiter } from "path";


const { equal } = computed;
const { service } = inject;
const { assign } = Object;
const { isArray } = Array;


export default Controller.extend({
	store: service(),

	substitutionsPlayer,

	// filter platform dependent player parameters
	players: computed(function() {
		const list = {};
		for ( const [ id, player ] of Object.entries( playersConfig ) ) {
			const obj = list[ id ] = assign( {}, player );
			obj.params = obj.params
				.map( param => {
					param = assign( {}, param );
					if ( param.args instanceof Object ) {
						param.args = param.args[ platform ];
					}

					return param;
				})
				.filter( param => !!param.args );
		}

		return list;
	}),

	playerPresets: computed(function() {
		const presets = [{
			id: "default",
			label: "No preset"
		}];
		for ( const [ id, { name: label, exec, disabled } ] of Object.entries( playersConfig ) ) {
			if ( disabled || !exec[ platform ] ) { continue; }
			presets.push({ id, label });
		}

		return presets;
	}),

	playerPlaceholder: computed( "model.streaming.player", function() {
		const player = get( this, "model.streaming.player" );
		if ( player === "default" || !playersConfig[ player ] ) {
			return "Leave blank for default player";
		}

		const exec = playersConfig[ player ][ "exec" ][ platform ];
		if ( !exec ) {
			return "Leave blank for default location";
		}

		return isArray( exec )
			? exec.join( `${delimiter} ` )
			: exec;
	}),

	playerPresetDefault: equal( "model.streaming.player", "default" ),

	playerPresetDefaultAndPlayerEmpty: computed(
		"playerPresetDefault",
		"model.streaming.players.default.exec",
		function() {
			return get( this, "playerPresetDefault" )
			    && !get( this, "model.streaming.players.default.exec" );
		}
	)
});
