import { set, action } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ObjectBuffer from "utils/ember/ObjectBuffer";


const reRouteNames = /^settings\.\w+$/;


export default class SettingsRoute extends Route {
	/** @type {ModalService} */
	@service modal;
	/** @type {SettingsService} */
	@service settings;


	model() {
		return ObjectBuffer.create({
			content: this.settings.content.toJSON()
		});
	}

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	}

	@action
	willTransition( previousTransition ) {
		// don't show modal when transitioning between settings subroutes
		if ( previousTransition && reRouteNames.test( previousTransition.targetName ) ) {
			return true;
		}

		// check whether the user has changed any values
		if ( !this.controller.model.isDirty ) { return; }

		// stay here...
		previousTransition.abort();

		// and let the user decide
		this.modal.openModal( "confirm", this.controller, {
			previousTransition
		});
	}
}
