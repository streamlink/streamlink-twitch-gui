import {
	get,
	computed,
	Controller
} from "Ember";
import {
	main,
	files
} from "config";
import Settings from "models/localstorage/Settings";
import {
	isSupported as isNotificationSupported,
	show as showNotification
} from "utils/Notification";
import { isWin } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";


const { "display-name": displayName } = main;
const { icons: { big: bigIcon } } = files;


export default Controller.extend({
	Settings,

	// filter available notification providers
	notifyProvider: computed(function() {
		return Settings.notify_provider
			.filter( item => isNotificationSupported( item.value ) );
	}),

	actions: {
		testNotification( success, failure ) {
			let provider = get( this, "model.notify_provider" );
			let icon = isWin && !DEBUG
				? resolvePath( "%NWJSAPPPATH%", bigIcon )
				: resolvePath( bigIcon );
			let notification = {
				title: displayName,
				message: "This is a test notification",
				icon: icon
			};

			showNotification( provider, notification, provider !== "auto" )
				.then( success, failure )
				.catch( () => {} );
		}
	}
});
