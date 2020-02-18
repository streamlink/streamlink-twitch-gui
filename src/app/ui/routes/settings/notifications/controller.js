import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { main as mainConfig } from "config";
import SettingsNotification from "data/models/settings/notification/fragment";
import NotificationData from "services/notification/data";
import { iconGroup as icon } from "services/notification/icons";
import { isSupported, showNotification } from "services/notification/provider";


const { "display-name": displayName } = mainConfig;
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

			const data = new NotificationData({
				title: displayName,
				icon,
				message
			});

			showNotification( provider, data, true )
				.then( success, failure )
				.catch( () => {} );
		}
	}
});
