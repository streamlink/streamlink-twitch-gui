import { get, set, observer } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import { getMenu } from "nwjs/Tray";


const { items } = getMenu();


export default Mixin.create({
	i18n: service(),

	_trayMenuItem: null,

	// will be overridden by NotificationService
	enabled: false,
	paused: false,

	_traymenuItemObserver: observer( "enabled", function() {
		let item = get( this, "_trayMenuItem" );

		if ( !get( this, "enabled" ) ) {
			// reset paused state if notifications get disabled
			set( this, "paused", false );

			// remove tray menu item
			if ( item ) {
				items.removeObject( item );
				set( this, "_trayMenuItem", null );
			}

		} else if ( !item ) {
			const i18n = get( this, "i18n" );
			const paused = get( this, "paused" );

			item = {
				type   : "checkbox",
				label  : i18n.t( "services.notification.tray.pause.label" ).toString(),
				tooltip: i18n.t( "services.notification.tray.pause.tooltip" ).toString(),
				checked: paused,
				click  : item => {
					set( this, "paused", item.checked );
				}
			};

			// make pause checkbox the first menu item
			items.unshiftObject( item );
			set( this, "_trayMenuItem", item );
		}
	}).on( "init" )
});
