import { get, computed } from "@ember/object";
import { and } from "@ember/object/computed";
import { default as Service, inject as service } from "@ember/service";
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
		i18n: service(),
		settings: service(),

		error: false,
		paused: false,

		enabled: and( "auth.session.isLoggedIn", "settings.notification.enabled" ),

		running: computed( "enabled", "paused", function() {
			return get( this, "enabled" ) && !get( this, "paused" );
		}),

		init() {
			this._super( ...arguments );
			// initialize lazy computed properties
			get( this, "i18n" );
			get( this, "running" );
		},

		statusText: computed( "enabled", "paused", "error", "i18n.locale", function() {
			if ( !this.enabled ) {
				return this.i18n.t( "services.notification.status.disabled" ).toString();
			}
			if ( this.paused ) {
				return this.i18n.t( "services.notification.status.paused" ).toString();
			}
			if ( this.error ) {
				return this.i18n.t( "services.notification.status.error" ).toString();
			}

			return this.i18n.t( "services.notification.status.enabled" ).toString();
		})
	}
);
