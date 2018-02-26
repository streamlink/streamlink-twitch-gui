import {
	get,
	computed
} from "@ember/object";
import { and } from "@ember/object/computed";
import {
	default as Service,
	inject as service
} from "@ember/service";
import NotificationServicePollingMixin from "./polling";
import NotificationServiceDispatchMixin from "./dispatch";
import NotificationServiceBadgeMixin from "./badge";
import NotificationServiceFollowMixin from "./follow";
import NotificationServiceTrayMixin from "./tray";


export default Service.extend(
	NotificationServicePollingMixin,
	NotificationServiceDispatchMixin,
	NotificationServiceBadgeMixin,
	NotificationServiceFollowMixin,
	NotificationServiceTrayMixin,
	{
		auth: service(),
		settings: service(),

		error: false,
		paused: false,

		enabled: and( "auth.session.isLoggedIn", "settings.notification.enabled" ),

		running: computed( "enabled", "paused", function() {
			return get( this, "enabled" ) && !get( this, "paused" );
		}),

		init() {
			this._super( ...arguments );
			// read `running` on init and trigger the lazy computed property and its observers
			get( this, "running" );
		},

		statusText: computed( "enabled", "paused", "error", function() {
			const status = !get( this, "enabled" )
				? "disabled"
				: get( this, "paused" )
					? "paused"
					: get( this, "error" )
						? "offline"
						: "enabled";

			return `Desktop notifications are ${status}`;
		})
	}
);
