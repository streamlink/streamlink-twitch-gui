import {
	set,
	Route
} from "Ember";


export default Route.extend({
	model() {
		return this.modelFor( "settings" );
	},

	activate() {
		const settingsController = this.controllerFor( "settings" );
		set( settingsController, "currentSubmenu", this.routeName );
	},

	deactivate() {
		const settingsController = this.controllerFor( "settings" );
		set( settingsController, "isAnimated", true );
	}
});
