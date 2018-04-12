import NotificationProviderChromeNotifications from "./chrome-notifications";
import { isWin7 } from "utils/node/platform";


/**
 * Chromium Rich Notifications
 *   https://developer.chrome.com/apps/richNotifications
 *
 * Used on Windows 7, due to the lack of a native notification system.
 * Native notifications on Windows 8 and above require the snoretoast provider as long as Chromium
 * doesn't support them. Rich notifications are being used as a fallback.
 *
 * @class NotificationProviderRich
 * @implements NotificationProviderChromeNotifications
 * @implements NotificationProvider
 */
export default class NotificationProviderRich extends NotificationProviderChromeNotifications {
	static isSupported() {
		return isWin7;
	}

	static supportsListNotifications() {
		return true;
	}
}
