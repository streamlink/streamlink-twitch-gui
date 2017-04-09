import {
	get,
	set,
	getOwner,
	makeArray,
	inject,
	Application
} from "ember";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


const { service } = inject;



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
	 */
	transitionTo( routeName, models, queryParams, shouldReplace ) {
		let currentRoute = get( this, "router.currentRouteName" );

		if ( routeName === currentRoute && arguments.length === 1 ) {
			return this.refresh();

		} else {
			let router = get( this, "router" );
			let transition = router._doTransition(
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
		}
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
		let homepage = get( this, "settings.gui_homepage" );
		let method = noHistoryEntry
			? "replaceWith"
			: "transitionTo";
		get( this, "router" )[ method ]( homepage || "/featured" );
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


Application.instanceInitializer({
	name: "routing-service",

	initialize( application ) {
		let routingService = application.lookup( "service:-routing" );
		routingService.reopen( customRoutingService );
	}
});
