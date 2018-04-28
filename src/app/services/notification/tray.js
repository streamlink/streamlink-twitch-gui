import { get, set, observer } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";


export default Mixin.create({
	nwjs: service(),

	_trayMenuItem: null,

	// will be set by NotificationService
	enabled: false,
	paused: false,

	_trayMenuItemObserver: observer( "enabled", function() {
		const nwjs = get( this, "nwjs" );

		if ( !get( this, "enabled" ) ) {
			// reset paused state if notifications get disabled
			set( this, "paused", false );

			// remove tray menu item
			if ( this._trayMenuItem ) {
				nwjs.removeTrayMenuItem( this._trayMenuItem );
				this._trayMenuItem = null;
			}

		} else if ( !this._trayMenuItem ) {
			const paused = get( this, "paused" );
			this._trayMenuItem = {
				type   : "checkbox",
				label  : [ "services.notification.tray.pause.label" ],
				tooltip: [ "services.notification.tray.pause.tooltip" ],
				checked: paused,
				click  : item => {
					set( this, "paused", item.checked );
				}
			};

			// make pause checkbox the first menu item
			nwjs.addTrayMenuItem( this._trayMenuItem, 0 );
		}
	}).on( "init" )
});
