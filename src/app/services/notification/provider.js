import { logDebug } from "./logger";
import providers from "./providers";


/** @type {Map<string,NotificationProvider>} */
const instanceMap = new Map();
/** @type {Map<string,Promise>} */
const setupMap = new Map();


/**
 * Check whether a NotificationProvider is supported on the current platform
 * @param {string} provider
 * @returns {boolean}
 */
export function isSupported( provider ) {
	return providers.hasOwnProperty( provider )
		? providers[ provider ].isSupported()
		: false;
}


/**
 * Finds a NotificationProvider given by name, sets it up and displays a notification.
 * Falls back to the next provider if its setup or showing the notification fails.
 * @param {string} provider
 * @param {NotificationData} data
 * @param {boolean} newInst
 * @returns {Promise}
 */
export async function showNotification( provider, data, newInst ) {
	if ( !providers.hasOwnProperty( provider ) ) {
		throw new Error( "Invalid notification provider" );
	}

	const useFallbacks = provider === "auto";
	let foundProvider = false;

	for ( const [ current, Provider ] of Object.entries( providers ) ) {
		// start at the requested provider and continue from there if using fallbacks
		if ( !foundProvider && current !== provider ) {
			continue;
		}
		foundProvider = true;

		// the provider needs to be supported
		if ( !Provider.isSupported() ) {
			if ( useFallbacks ) {
				continue;
			} else {
				throw new Error( "The notification provider is not supported" );
			}
		}

		try {
			let instance;
			// create a provider instance if it doesn't exist yet
			if ( newInst || !instanceMap.has( current ) ) {
				/** @type {NotificationProvider} */
				instance = new Provider();
				instanceMap.set( current, instance );

				// set up provider instance
				try {
					const setup = instance.setup();
					setupMap.set( current, setup );
					// wait for setup to finish
					await setup;
				} catch ( err ) {
					// unregister if setup has failed
					instanceMap.delete( current );
					throw err;
				}

			} else {
				instance = instanceMap.get( current );
				// wait for setup to finish
				await setupMap.get( current );
			}

			// show the notification
			await logDebug( "Showing notification", { provider, current, data } );
			await instance.notify( data );
			return;

		} catch ( err ) {
			// provider is not working... try the next one
			if ( !useFallbacks ) {
				throw err;
			}
		}
	}

	throw new Error( "Couldn't find a notification provider" );
}
