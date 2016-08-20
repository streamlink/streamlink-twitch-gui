import {
	platform,
	isWinGte8,
	isMountainLion
} from "utils/node/platform";
import ProviderAuto from "./notification/NotificationProviderAuto";
import ProviderToast from "./notification/NotificationProviderToast";
import ProviderNotificationCenter from "./notification/NotificationProviderNotificationCenter";
import ProviderLibNotify from "./notification/NotificationProviderLibNotify";
import ProviderGrowl from "./notification/NotificationProviderGrowl";
import ProviderRich from "./notification/NotificationProviderRich";


const providers = {
	"auto": ProviderAuto,
	"toast": ProviderToast,
	"notificationcenter": ProviderNotificationCenter,
	"libnotify": ProviderLibNotify,
	"growl": ProviderGrowl,
	"rich": ProviderRich
};
const cache = {};


/**
 * Check whether a NotificationProvider is supported on the current platform
 * @param {string} provider
 * @returns {boolean}
 */
export function isSupported( provider ) {
	if ( !providers.hasOwnProperty( provider ) ) {
		return false;
	}

	let platforms = providers[ provider ].platforms;
	return platforms.hasOwnProperty( platform )
	    || isWinGte8 && platforms.hasOwnProperty( "win32gte8" )
	    || isMountainLion && platforms.hasOwnProperty( "mountainlion" );
}


/**
 * Get the name of a fallback provider
 * @param {String} provider
 * @returns {String}
 */
function getFallback( provider ) {
	let platforms = providers[ provider ].platforms;
	if ( isWinGte8 && platforms.hasOwnProperty( "win32gte8" ) ) {
		return platforms[ "win32gte8" ];
	}
	if ( isMountainLion && platforms.hasOwnProperty( "mountainlion" ) ) {
		return platforms[ "mountainlion" ];
	}
	return platforms[ platform ] || null;
}


/**
 * Create a notification
 * @param {String} provider
 * @param {Object} data
 * @param {Object?} setupData
 * @returns {Promise}
 */
function notify( provider, data, setupData ) {
	var providerInstance = cache.hasOwnProperty( provider )
		? cache[ provider ]
		: ( cache[ provider ] = new providers[ provider ]( setupData ) );

	data.sound = false;
	data.wait = false;

	return providerInstance.notify( data );
}


/**
 * Tests a NotificationProvider given by name and displays a notification
 * @param {String} provider
 * @param {Object} data
 * @param {Boolean?} noFallback
 * @returns {Promise}
 */
export function show( provider, data, noFallback ) {
	if ( !isSupported( provider ) ) {
		return Promise.reject( new Error( "Invalid provider" ) );
	}

	return providers[ provider ].test()
		.then(function( setupData ) {
			return notify( provider, data, setupData );
		})
		.catch(function( err ) {
			if ( noFallback ) {
				return Promise.reject( err );
			}

			function showFallback( provider ) {
				var fallbackProvider = getFallback( provider );

				return show( fallbackProvider, data )
					.catch(function( err ) {
						return fallbackProvider === null
							? Promise.reject( err )
							: showFallback( fallbackProvider );
					});
			}

			return showFallback( provider );
		});
}
