import { observer } from "@ember/object";
import { and } from "@ember/object/computed";
import { default as Evented, on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";


export default Mixin.create( Evented, {
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {SettingsService} */
	settings: service(),

	// will be overridden by NotificationService
	running: false,

	_badgeEnabled: and( "running", "settings.content.notification.badgelabel" ),

	_badgeEnabledObserver: observer( "_badgeEnabled", function() {
		if ( !this._badgeEnabled ) {
			this.nwjs.setBadgeLabel( "" );
		}
	}),

	_badgeStreamsAllListener: on( "streams-all", function( streams ) {
		if ( streams && this._badgeEnabled ) {
			this.nwjs.setBadgeLabel( `${streams.length}` );
		}
	})
});
