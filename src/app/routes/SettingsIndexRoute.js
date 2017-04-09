import {
	get,
	set,
	Route
} from "ember";


export default Route.extend({
	actions: {
		didTransition() {
			const settingsController = this.controllerFor( "settings" );
			let goto = get( settingsController, "currentSubmenu" );
			if ( !goto ) {
				goto = "settings.main";
			}

			set( settingsController, "isAnimated", false );

			this.replaceWith( goto );
		},

		willTransition() {
			return false;
		}
	}
});
