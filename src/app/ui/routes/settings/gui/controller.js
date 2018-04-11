import Controller from "@ember/controller";
import { get, set, observer } from "@ember/object";
import { equal } from "@ember/object/computed";
import {
	default as SettingsGui,
	ATTR_GUI_INTEGRATION_TASKBAR,
	ATTR_GUI_INTEGRATION_TRAY,
	ATTR_GUI_INTEGRATION_BOTH,
	ATTR_GUI_MINIMIZE_MINIMIZE,
	ATTR_GUI_MINIMIZE_TRAY
} from "data/models/settings/gui/fragment";


const {
	integration: contentGuiIntegration,
	minimize: contentGuiMinimize,
	focusrefresh: contentGuiFocusrefresh
} = SettingsGui;


export default Controller.extend({
	contentGuiIntegration,
	contentGuiMinimize,
	contentGuiFocusrefresh,

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
		set( contentGuiMinimize[ ATTR_GUI_MINIMIZE_MINIMIZE ], "disabled", noTask );
		set( contentGuiMinimize[ ATTR_GUI_MINIMIZE_TRAY ], "disabled", noTray );
	})
});
