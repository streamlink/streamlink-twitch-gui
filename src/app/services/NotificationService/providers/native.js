import {
	window as Window
} from "nwjs/Window";
import { isDarwin } from "utils/node/platform";


const { Notification } = Window;


/**
 * HTML5 Notifications API
 *   https://notifications.spec.whatwg.org/
 *   https://developer.mozilla.org/en-US/docs/Web/API/notification
 *
 * Using the operating system's native notification system.
 *
 * Windows
 *   still unsupported
 *   https://crbug.com/516147
 *
 * macOS
 *   since Chromium 54 (NWjs 0.18) behind a feature flag
 *   since Chromium 59 (NWjs 0.23)
 *   https://crbug.com/326539
 *
 * Linux
 *   since Chromium 61 (NWjs 0.25) behind a feature flag
 *   https://crbug.com/676220
 *
 * Issues:
 *   - "settings" action button can't be disabled
 *     Clicking the settings action will open a new NWjs window that tries to load Chromium's
 *     settings page, which doesn't exist in NWjs and is therefore empty.
 *     This is "acceptable" on macOS (native notifications would require 3rd party applications),
 *     but on Linux, we have the freedesktop provider that can set the correct actions.
 *
 * @class NotificationProviderNative
 * @implements NotificationProvider
 */
export default class NotificationProviderNative {
	static isSupported() {
		return isDarwin;
	}

	async setup() {}

	/**
	 * @param {NotificationData} data
	 * @returns {Promise}
	 */
	async notify( data ) {
		await new Promise( ( resolve, reject ) => {
			const notification = new Notification( data.title, {
				body: data.getMessageAsString(),
				icon: data.getIconAsFileURI(),
				actions: []
			});

			notification.addEventListener( "click", () => data.click() );
			notification.addEventListener( "show", () => resolve() );
			notification.addEventListener( "error", () =>
				reject( new Error( "Could not show notification" ) )
			);
		});
	}
}
