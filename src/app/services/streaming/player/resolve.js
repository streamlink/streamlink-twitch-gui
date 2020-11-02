import { players as playersConfData } from "config";
import { logDebug } from "../logger";
import { playerCache } from "../cache";
import { PlayerError } from "../errors";
import isAborted from "../is-aborted";
import ExecObj from "../exec-obj";
import { platform } from "utils/node/platform";
import whichFallback from "utils/node/fs/whichFallback";


const { hasOwnProperty } = {};
const defaultProfileName = "default";


/**
 * @param {Stream} stream
 * @param {String} player
 * @param {Object} playersUserData
 * @returns {Promise.<ExecObj>}
 */
export default async function( stream, player, playersUserData ) {
	isAborted( stream );

	const cache = playerCache.get();
	if ( cache ) {
		return cache;
	}

	if ( player === defaultProfileName ) {
		return getDefaultPlayerProfile( playersUserData );
	}

	if (
		   !hasOwnProperty.call( playersConfData, player )
		|| !hasOwnProperty.call( playersUserData, player )
	) {
		throw new PlayerError( `Invalid player profile: ${player}` );
	}

	// player objects
	const playerConfData = playersConfData[ player ];
	const playerUserData = playersUserData[ player ];

	await logDebug( "Resolving player", { player, playerUserData } );

	// custom or default executable
	const playerConfDataExec = playerConfData[ "exec" ][ platform ];
	const playerUserDataExec = playerUserData[ "exec" ];
	const playerExec = playerUserDataExec || playerConfDataExec;
	if ( !playerExec ) {
		throw new PlayerError( "Missing player executable name" );
	}

	// the object containing the path to the exec (and pythonscript) and env data
	const execObj = new ExecObj();

	// try to find the executable
	try {
		execObj.exec = await whichFallback( playerExec, playerConfData[ "fallback" ] );
	} catch ( e ) {
		throw new PlayerError( "Couldn't find player executable" );
	}

	try {
		execObj.params = getPlayerParams( playerConfData, playerUserData );
	} catch ( e ) {
		throw new PlayerError( "Error while generating player parameters" );
	}

	await logDebug( "Resolved player", execObj );

	playerCache.set( execObj );

	return execObj;
}


/**
 * Build the player parameter string from the preset and provided custom params
 * This is a single string being used as the provider's --player-args parameter value
 * @param {Object} playerConfData
 * @param {Object[]} playerConfData.params
 * @param {Object} playerUserData
 * @param {string?} playerUserData.args
 * @returns {string}
 */
function getPlayerParams( playerConfData, playerUserData ) {
	const parameters = [];

	// add custom user parameters at the beginning
	const { args } = playerUserData;
	if ( args ) {
		parameters.push( args );
	}

	// add player specific parameters
	playerConfData.params
		.map( param => {
			let { name, type, args } = param;

			if ( args instanceof Object ) {
				if ( !hasOwnProperty.call( args, platform ) ) {
					return null;
				}
				args = args[ platform ];
			}

			switch ( type ) {
				case "boolean":
					return playerUserData[ name ]
						? args
						: null;
				default:
					throw new Error( `Invalid or unsupported parameter type: ${type}` );
			}
		})
		.filter( param => param !== null )
		.forEach( param => parameters.push( param ) );

	return parameters.join( " " );
}

/**
 * @param {Object} playersUserData
 * @param {String?} playersUserData.exec
 * @param {String?} playersUserData.args
 * @returns {ExecObj}
 */
function getDefaultPlayerProfile( playersUserData ) {
	const execObj = new ExecObj();
	const playersUserDataDefault = playersUserData[ defaultProfileName ] || {};

	execObj.exec = playersUserDataDefault[ "exec" ] || null;
	execObj.params = execObj.exec && playersUserDataDefault[ "args" ] || null;

	playerCache.set( execObj );

	return execObj;
}
