import {
	get,
	computed,
	Controller
} from "Ember";
import { players } from "config";
import { playerSubstitutions } from "models/stream/parameters";
import { platform } from "utils/node/platform";
import { delimiter } from "path";


const { assign } = Object;
const { isArray } = Array;
const kPlayers = Object.keys( players );


export default Controller.extend({
	substitutionsPlayer: playerSubstitutions,

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

	playerPresetDefaultAndPlayerEmpty: computed(
		"model.player_preset",
		"model.player.default.exec",
		function() {
			let preset = get( this, "model.player_preset" );
			let player = get( this, "model.player" );

			return preset === "default" && !get( player, "default.exec" );
		}
	)
});
