import Controller from "@ember/controller";
import {
	get,
	computed
} from "@ember/object";
import {
	main,
	files
} from "config";
import { isDebug } from "nwjs/debug";
import SettingsNotification from "models/localstorage/Settings/notification";
import NotificationData from "services/NotificationService/data";
import {
	isSupported,
	showNotification
} from "services/NotificationService/provider";
import { isWin } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";


const { "display-name": displayName } = main;
const { icons: { big: bigIcon } } = files;
const {
	filter: contentNotificationFilter,
	click: contentNotificationClick,
	clickGroup: contentNotificationClickGroup
} = SettingsNotification;


export default Controller.extend({
	contentNotificationFilter,
	contentNotificationClick,
	contentNotificationClickGroup,

	// filter available notification providers
	contentNotificationProviders: computed(function() {
		return SettingsNotification.providers
			.filter( item => isSupported( item.value ) || item.value === "auto" );
	}),

	actions: {
		testNotification( success, failure ) {
			const provider = get( this, "model.notification.provider" );
			const icon = isWin && !isDebug
				? resolvePath( "%NWJSAPPPATH%", bigIcon )
				: resolvePath( bigIcon );

			const data = new NotificationData({
				title: displayName,
				message: "This is a test notification",
				icon: icon
			});

			showNotification( provider, data, true )
				.then( success, failure )
				.catch( () => {} );
		}
	}
});
