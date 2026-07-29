import { get, computed } from "@ember/object";
import { and } from "@ember/object/computed";
import { default as Service, inject as service } from "@ember/service";
import NotificationServicePollingMixin from "./polling";
import NotificationServiceDispatchMixin from "./dispatch";
import NotificationServiceBadgeMixin from "./badge";
import NotificationServiceTrayMixin from "./tray";


export default Service.extend(
	NotificationServicePollingMixin,
	NotificationServiceDispatchMixin,
	NotificationServiceBadgeMixin,
	NotificationServiceTrayMixin,
	/** @class NotificationService */
	{
		/** @type {AuthService} */
		auth: service(),
		/** @type {IntlService} */
		intl: service(),
		/** @type {SettingsService} */
		settings: service(),

		error: false,
		paused: false,

		enabled: and( "auth.session.isLoggedIn", "settings.content.notification.enabled" ),

		running: computed( "enabled", "paused", function() {
			return get( this, "enabled" ) && !get( this, "paused" );
		}),

		init() {
			this._super( ...arguments );
			// initialize lazy computed properties
			get( this, "intl" );
			get( this, "running" );
		},

		statusText: computed( "enabled", "paused", "error", "intl.locale", function() {
			if ( !this.enabled ) {
				return this.intl.t( "services.notification.status.disabled" ).toString();
			}
			if ( this.paused ) {
				return this.intl.t( "services.notification.status.paused" ).toString();
			}
			if ( this.error ) {
				return this.intl.t( "services.notification.status.error" ).toString();
			}

			return this.intl.t( "services.notification.status.enabled" ).toString();
		})
	}
);
