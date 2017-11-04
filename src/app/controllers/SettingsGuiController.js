import {
	get,
	set,
	computed,
	observer,
	Controller
} from "ember";
import SettingsGui, {
	ATTR_GUI_INTEGRATION_TASKBAR,
	ATTR_GUI_INTEGRATION_TRAY,
	ATTR_GUI_INTEGRATION_BOTH,
	ATTR_GUI_MINIMIZE_MINIMIZE,
	ATTR_GUI_MINIMIZE_TRAY
} from "models/localstorage/Settings/gui";


const { equal } = computed;


export default Controller.extend({
	SettingsGui,

	hasTaskBarIntegration: equal( "model.gui.integration", ATTR_GUI_INTEGRATION_TASKBAR ),
	hasBothIntegrations: equal( "model.gui.integration", ATTR_GUI_INTEGRATION_BOTH ),

	_integrationObserver: observer( "model.gui.integration", function() {
		const integration = get( this, "model.gui.integration" );
		const minimize = get( this, "model.gui.minimize" );
		const noTask = ( integration & ATTR_GUI_INTEGRATION_TASKBAR ) === 0;
		const noTray = ( integration & ATTR_GUI_INTEGRATION_TRAY ) === 0;

		// make sure that disabled options are not selected
		if ( noTask && minimize === ATTR_GUI_MINIMIZE_MINIMIZE ) {
			set( this, "model.gui.minimize", ATTR_GUI_MINIMIZE_TRAY );
		}
		if ( noTray && minimize === ATTR_GUI_MINIMIZE_TRAY ) {
			set( this, "model.gui.minimize", ATTR_GUI_MINIMIZE_MINIMIZE );
		}

		// enable/disable buttons
		const minimizeIdMinimize = SettingsGui.minimize.findIndex( ({ id }) =>
			id === ATTR_GUI_MINIMIZE_MINIMIZE
		);
		const minimizeIdTray = SettingsGui.minimize.findIndex( ({ id }) =>
			id === ATTR_GUI_MINIMIZE_TRAY
		);
		set( SettingsGui, `minimize.${minimizeIdMinimize}.disabled`, noTask );
		set( SettingsGui, `minimize.${minimizeIdTray}.disabled`, noTray );
	})
});
