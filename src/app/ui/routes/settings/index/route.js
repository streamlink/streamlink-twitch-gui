import { set, action } from "@ember/object";
import Route from "@ember/routing/route";


export default class SettingsIndexRoute extends Route {
	@action
	didTransition() {
		const settingsController = this.controllerFor( "settings" );
		const goto = settingsController.currentSubmenu || "settings.main";

		set( settingsController, "isAnimated", false );

		this.replaceWith( goto );
	}

	@action
	willTransition() {
		return false;
	}
}
