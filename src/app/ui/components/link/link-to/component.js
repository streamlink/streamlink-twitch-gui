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

	/**
	 * Checks whether the link is active because of an active child route.
	 * The `current-when` property which overrides the active state is not supported, since it's
	 * not being used in this project (at this present time).
	 * @returns {boolean}
	 */
	_isActiveAncestor() {
		const currentState = this._routing.currentState;
		/* istanbul ignore next */
		if ( !currentState ) {
			return false;
		}

		/** @type {{name: string}[]} */
		const { routeInfos } = currentState.routerJsState;
		const routeInfosAncestors = routeInfos.slice( 0, -1 );
		const routeInfosLeafName = routeInfos[ routeInfos.length - 1 ].name;
		const routeName = this.qualifiedRouteName;

		return routeInfosLeafName !== routeName
		    && routeInfosLeafName !== `${routeName}.index`
		    && routeInfosAncestors.find( ({ name }) => name === routeName );
	},

	_invoke( e ) {
		// prevent new windows from being opened
		if ( e.buttons & 6 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}

		// perform default action if link is inactive
		// or if it is active, but only because of an active child route
		if ( !this._active || this._isActiveAncestor() ) {
			return this._super( ...arguments );
		}

		// enable route refreshing by clicking on the same link again
		e.preventDefault();
		e.stopImmediatePropagation();
		this.router.refresh();
		return false;
	}
});
