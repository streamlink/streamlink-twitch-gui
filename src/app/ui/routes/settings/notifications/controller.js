import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { main, files } from "config";
import { isDebug } from "nwjs/debug";
import SettingsNotification from "data/models/settings/notification/fragment";
import NotificationData from "services/notification/data";
import { isSupported, showNotification } from "services/notification/provider";
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

	i18n: service(),

	// filter available notification providers
	contentNotificationProviders: computed(function() {
		return SettingsNotification.providers
			.filter( item => isSupported( item.id ) || item.id === "auto" );
	}),

	actions: {
		testNotification( success, failure ) {
			const i18n = get( this, "i18n" );
			const provider = get( this, "model.notification.provider" );
			const message = i18n.t( "settings.notifications.provider.test.message" ).toString();
			const icon = isWin && !isDebug
				? resolvePath( "%NWJSAPPPATH%", bigIcon )
				: resolvePath( bigIcon );

			const data = new NotificationData({
				title: displayName,
				icon: icon,
				message
			});

			showNotification( provider, data, true )
				.then( success, failure )
				.catch( () => {} );
		}
	}
});
