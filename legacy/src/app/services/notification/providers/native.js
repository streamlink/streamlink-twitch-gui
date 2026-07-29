import NotificationProviderChromeNotifications from "./chrome-notifications";
import { isDarwin, isLinux } from "utils/node/platform";


/**
 * Uses the system's native notification system
 *
 * @class NotificationProviderNative
 * @implements NotificationProviderChromeNotifications
 * @implements NotificationProvider
 */
export default class NotificationProviderNative extends NotificationProviderChromeNotifications {
	static isSupported() {
		return isDarwin || isLinux;
	}

	static supportsListNotifications() {
		return false;
	}
}
