import {
	get,
	computed,
	inject,
	observer,
	on,
	Evented,
	Mixin
} from "ember";
import nwWindow from "nwjs/Window";


const { and } = computed;
const { service } = inject;


export default Mixin.create( Evented, {
	settings: service(),

	// will be overridden by NotificationService
	running: false,

	_badgeEnabled: and( "running", "settings.notify_badgelabel" ),

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
