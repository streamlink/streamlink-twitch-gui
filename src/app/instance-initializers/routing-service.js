import { getOwner } from "@ember/application";
import { makeArray } from "@ember/array";
import { get, set } from "@ember/object";
import { inject as service } from "@ember/service";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


function resemblesURL( str)  {
	return typeof str === "string"
	    && ( str === "" || str[0] === "/" );
}


// RoutingService is not public (yet)
// Customize it in an Application.instanceInitializer
const customRoutingService = {
	settings: service(),

	/**
	 * Refresh current route if the user tries to transition to it again
	 * Override and fix _super behavior (arguments are not being shifted correctly)
	 * @param {String} routeName
	 * @param {Object[]?} models
	 * @param {Object?} queryParams
	 * @param {Boolean?} shouldReplace
	 * @return {Promise}
	 */
	transitionTo( routeName, models, queryParams, shouldReplace ) {
		if ( arguments.length === 1 && resemblesURL( routeName ) ) {
			if ( routeName === get( this, "router.url" ) ) {
				return this.refresh();
			} else {
				const router = get( this, "router" );
				return router._doURLTransition( "transitionTo", routeName );
			}
		}

		if ( arguments.length === 1 && routeName === get( this, "router.currentRouteName" ) ) {
			return this.refresh();
		}

		const router = get( this, "router" );
		const transition = router._doTransition(
			routeName,
			makeArray( models ),
			queryParams
				? queryParams.queryParams || queryParams
				: {}
		);

		if ( shouldReplace ) {
			transition.method( "replace" );
		}

		return transition;
	},

	/**
	 * Refresh current route or go back to previous route if current route is the ErrorRoute
	 */
	refresh() {
		let routeName = get( this, "router.currentRouteName" );

		if ( routeName === "error" ) {
			let errorTransition = get( this, "router.errorTransition" );
			if ( errorTransition ) {
				set( this, "router.errorTransition", null );
				return errorTransition.retry();

			} else {
				routeName = get( this, "router.lastRouteName" );
				if ( routeName ) {
					return this.transitionTo( routeName );
				}
			}

		} else {
			return getOwner( this ).lookup( `route:${routeName}` ).refresh();
		}
	},

	history( action ) {
		window.history.go( +action );
	},

	homepage( noHistoryEntry ) {
		const router = get( this, "router" );
		const homepage = get( this, "settings.gui.homepage" );
		const method = noHistoryEntry
			? "replaceWith"
			: "transitionTo";
		router[ method ]( homepage || "/featured" );
	},

	openBrowserOrTransitionToChannel( url ) {
		if ( !url ) { return; }

		let stream = getStreamFromUrl( url );
		if ( stream ) {
			this.transitionTo( "channel", stream );
		} else {
			openBrowser( url );
		}
	}
};


export default {
	name: "routing-service",

	initialize( application ) {
		let routingService = application.lookup( "service:-routing" );
		routingService.reopen( customRoutingService );
	}
};
