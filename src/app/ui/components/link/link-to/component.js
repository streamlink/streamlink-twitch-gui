import { computed } from "@ember/object";
import LinkComponent from "@ember/routing/link-component";
import { inject as service } from "@ember/service";


export default LinkComponent.extend({
	/** @type {RouterService} */
	router: service(),

	_active: computed(
		"_routing.currentState",
		"_routing.currentRouteName",
		"attrs.params",
		function() {
			const currentState = this._routing.currentState;

			return currentState
			    && this._isActive( currentState )
			    && this._routing.currentRouteName !== "error";
		}
	),

	active: computed( "activeClass", "_active", "_routing.currentRouteName", function() {
		return this._active ? this.activeClass : false;
	}),

	_invoke( e ) {
		// prevent new windows from being opened
		if ( e.buttons & 6 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}

		if ( !this._active ) {
			return this._super( ...arguments );
		}

		// enable route refreshing by clicking on the same link again
		e.preventDefault();
		e.stopImmediatePropagation();
		this.router.refresh();
		return false;
	}
});
