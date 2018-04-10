import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ObjectBuffer from "utils/ember/ObjectBuffer";


const reRouteNames = /^settings\.\w+$/;


export default Route.extend({
	modal: service(),
	settings: service(),

	model() {
		const settings = get( this, "settings.content" );

		return ObjectBuffer.create({
			content: settings.toJSON()
		});
	},

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	},

	actions: {
		willTransition( previousTransition ) {
			// don't show modal when transitioning between settings subroutes
			if ( previousTransition && reRouteNames.test( previousTransition.targetName ) ) {
				return true;
			}

			// check whether the user has changed any values
			const controller = get( this, "controller" );
			if ( !get( controller, "model.isDirty" ) ) { return; }

			// stay here...
			previousTransition.abort();

			// and let the user decide
			get( this, "modal" ).openModal( "confirm", controller, {
				previousTransition
			});
		}
	}
});
