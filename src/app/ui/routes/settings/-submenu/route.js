import { set } from "@ember/object";
import Route from "@ember/routing/route";


export default class SettingsSubmenuRoute extends Route {
	model() {
		return this.modelFor( "settings" );
	}

	activate() {
		const settingsController = this.controllerFor( "settings" );
		set( settingsController, "currentSubmenu", this.routeName );
	}

	deactivate() {
		const settingsController = this.controllerFor( "settings" );
		set( settingsController, "isAnimated", true );
	}
}
