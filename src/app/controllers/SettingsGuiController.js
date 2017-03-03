import {
	get,
	set,
	computed,
	observer,
	Controller
} from "Ember";
import Settings from "models/localstorage/Settings";


const { equal } = computed;


export default Controller.extend({
	Settings,

	hasTaskBarIntegration: equal( "model.gui_integration", 1 ),
	hasBothIntegrations  : equal( "model.gui_integration", 3 ),

	_minimizeObserver: observer( "model.gui_integration", function() {
		const int = get( this, "model.gui_integration" );
		const min = get( this, "model.gui_minimize" );
		const noTask = ( int & 1 ) === 0;
		const noTray = ( int & 2 ) === 0;

		// make sure that disabled options are not selected
		if ( noTask && min === 1 ) {
			set( this, "model.gui_minimize", 2 );
		}
		if ( noTray && min === 2 ) {
			set( this, "model.gui_minimize", 1 );
		}

		// enable/disable buttons
		set( Settings, "minimize.1.disabled", noTask );
		set( Settings, "minimize.2.disabled", noTray );
	})
});
