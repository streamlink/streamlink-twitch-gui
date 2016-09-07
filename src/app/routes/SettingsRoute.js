import {
	get,
	set,
	inject,
	Route
} from "Ember";
import ObjectBuffer from "utils/ember/ObjectBuffer";


const { service } = inject;

const reRouteNames = /^settings\.\w+$/;


export default Route.extend({
	modal: service(),
	settings: service(),

	disableAutoRefresh: true,

	model() {
		var settings = get( this, "settings.content" );
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
			if ( !get( this, "controller.model.isDirty" ) ) { return; }

			// stay here...
			previousTransition.abort();

			// and let the user decide
			get( this, "modal" ).openModal( "confirm", this.controller, {
				previousTransition
			});
		}
	}
});
