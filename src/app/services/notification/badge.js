import { get, observer } from "@ember/object";
import { and } from "@ember/object/computed";
import { default as Evented, on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import nwWindow from "nwjs/Window";


export default Mixin.create( Evented, {
	settings: service(),

	// will be overridden by NotificationService
	running: false,

	_badgeEnabled: and( "running", "settings.notification.badgelabel" ),

	_badgeEnabledObserver: observer( "_badgeEnabled", function() {
		if ( !get( this, "_badgeEnabled" ) ) {
			this.badgeSetLabel( "" );
		}
	}),

	_badgeStreamsAllListener: on( "streams-all", function( streams ) {
		if ( streams && get( this, "_badgeEnabled" ) ) {
			const length = get( streams, "length" );
			this.badgeSetLabel( String( length ) );
		}
	}),

	badgeSetLabel( label ) {
		// update badge label or remove it
		nwWindow.setBadgeLabel( label );
	}
});
