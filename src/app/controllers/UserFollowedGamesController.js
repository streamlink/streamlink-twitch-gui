import {
	get,
	set,
	computed,
	Controller
} from "Ember";


export default Controller.extend({
	queryParams: [ "all" ],

	gamePath: computed( "all", function() {
		const all = get( this, "all" );

		return all === "true"
			? "game"
			: "game.game";
	}),

	actions: {
		toggleAll() {
			// query parameters are strings
			set( this, "all", get( this, "all" ) === "true" ? "false" : "true" );
		}
	}
});
