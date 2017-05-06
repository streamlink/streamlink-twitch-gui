import {
	get,
	computed,
	Controller
} from "ember";
import { players } from "config";
import substitutionsPlayer from "services/StreamingService/player/substitutions";
import { platform } from "utils/node/platform";
import { delimiter } from "path";


const { equal } = computed;
const { assign } = Object;
const { isArray } = Array;
const kPlayers = Object.keys( players );


export default Controller.extend({
	substitutionsPlayer,

	// filter platform dependent player parameters
	players: computed(function() {
		return kPlayers
			.reduce( ( playerlist, playername ) => {
				let playerObj = assign( {}, players[ playername ] );
				playerObj.params = playerObj.params
					.map( param => {
						param = assign( {}, param );
						if ( param.args instanceof Object ) {
							param.args = param.args[ platform ];
						}

						return param;
					})
					.filter( param => !!param.args );

				playerlist[ playername ] = playerObj;

				return playerlist;
			}, {} );
	}),

	playerPresets: computed(function() {
		let presetList = kPlayers
			.filter( id =>
				   players[ id ][ "exec" ][ platform ]
				&& players[ id ][ "disabled" ] !== true
			)
			.map( id => ({
				id,
				label: players[ id ][ "name" ]
			}) );

		presetList.unshift({
			id   : "default",
			label: "No preset"
		});

		return presetList;
	}),

	playerPlaceholder: computed( "model.player_preset", function() {
		let preset = get( this, "model.player_preset" );
		if ( preset === "default" || !players[ preset ] ) {
			return "Leave blank for default player";
		}

		let exec = players[ preset ][ "exec" ][ platform ];
		if ( !exec ) {
			return "Leave blank for default location";
		}

		if ( isArray( exec ) ) {
			exec = exec.join( `${delimiter} ` );
		}

		return exec;
	}),

	playerPresetDefault: equal( "model.player_preset", "default" ),

	playerPresetDefaultAndPlayerEmpty: computed(
		"playerPresetDefault",
		"model.player.default.exec",
		function() {
			return get( this, "playerPresetDefault" )
			    && !get( this, "model.player.default.exec" );
		}
	)
});
