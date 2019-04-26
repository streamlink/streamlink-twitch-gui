import Controller from "@ember/controller";
import { get, computed, action } from "@ember/object";
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


export default class SettingsNotificationsController extends Controller {
	/** @type {I18nService} */
	@service i18n;

	contentNotificationFilter = contentNotificationFilter;
	contentNotificationClick = contentNotificationClick;
	contentNotificationClickGroup = contentNotificationClickGroup;

	// filter available notification providers
	@computed()
	get contentNotificationProviders() {
		return SettingsNotification.providers
			.filter( item => isSupported( item.id ) || item.id === "auto" );
	}


	@action
	testNotification( success, failure ) {
		const provider = get( this, "model.notification.provider" );
		const message = this.i18n.t( "settings.notifications.provider.test.message" ).toString();

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
