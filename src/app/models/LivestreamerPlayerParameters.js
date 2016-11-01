import { get } from "Ember";
import { players } from "config";
import whichFallback from "utils/node/fs/whichFallback";


/**
 * @param {Settings} settings
 * @returns {Object[]}
 */
function getPlayerData( settings ) {
	let player = get( settings, "player" );
	let preset = get( settings, "player_preset" );

	if ( !preset || !player.hasOwnProperty( preset ) ) {
		preset = "default";
	}

	return [
		// player settings
		get( player, preset ) || {},
		// player preset data
		get( players, preset ) || {}
	];
}


/**
 * Resolve the player executable path and use fallbacks
 * @param {Settings} settings
 * @returns {Promise.<Object>}
 */
export function getPlayerExec( settings ) {
	let [ playerSettings, playerPreset ] = getPlayerData( settings );
	let exec = get( playerSettings, "exec" ) || get( playerPreset, "exec" ) || "";

	// no player path or preset was selected
	if ( exec === "" ) {
		return Promise.resolve();
	}

	return whichFallback( exec, playerPreset.fallback )
		.then(function( exec ) {
			// return an object with an exec property for the EmberData.PromiseObject
			return { exec };
		})
		.catch(function() {
			return Promise.reject( new Error( "Unable to find player executable" ) );
		});
}


/**
 * Build the player parameter string out of the preset and custom params
 * @param {Settings} settings
 * @returns {String}
 */
export function getPlayerParams( settings ) {
	let [ playerData, { params: playerPresetParams } ] = getPlayerData( settings );

	let args = get( playerData, "args" ) || "";
	let params = get( playerData, "params" ) || {};

	// get the content of an ObjectBuffer
	if ( params.getContent instanceof Function ) {
		params = params.getContent();
	}

	// build the parameter preset string
	let paramlist = Object.keys( params )
		.map(function( param ) {
			let paramObj = playerPresetParams.findBy( "name", param );
			if ( !paramObj ) { return ""; }

			switch ( paramObj.type ) {
				case "boolean":
					return params[ param ]
						? paramObj.args
						: null;
				default:
					return null;
			}
		})
		.filter(function( item ) {
			return item !== null;
		});

	// combine preset and custom params
	let res = [ ...paramlist, args ].join( " " );

	// fix missing {filename} variable
	if ( res && res.indexOf( "{filename}" ) === -1 ) {
		res = `${res} {filename}`;
	}

	return res;
}
