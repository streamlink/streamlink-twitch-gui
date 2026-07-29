import { inject as service } from "@ember/service";
import getStreamFromUrl from "utils/getStreamFromUrl";


const { hasOwnProperty } = {};

function resemblesURL( str ) {
	return typeof str === "string"
	    && ( str === "" || str[0] === "/" );
}

function extractRouteArgs( ...args ) {
	const last = args[ args.length - 1 ];
	const queryParams = last && hasOwnProperty.call( last, "queryParams" )
		? args.pop().queryParams
		: {};
	const routeName = args.shift();

	return { routeName, models: args, queryParams };
}


function initialize( application ) {
	const RouterService = application.lookup( "service:router" );
	const RoutingService = application.lookup( "service:-routing" );
	/** @type {EmberRouter} */
	const router = application.lookup( "router:main" );

	// Not sure whether customizing the private RoutingService is still needed, since the app code
	// has moved to the RouterService, but it may be necessary for Ember-internal stuff
	RoutingService.reopen( /** @class RoutingService */ {
		/**
		 * Add custom refresh logic when trying to transition to the current route
		 * @param {string} routeName
		 * @param {Object[]?} models
		 * @param {Object?} queryParams
		 * @param {boolean?} shouldReplace
		 * @returns {Transition}
		 */
		transitionTo( routeName, models, queryParams, shouldReplace ) {
			if ( routeName === router.currentRouteName ) {
				return RouterService.refresh();
			}

			const transition = router._doTransition( routeName, models, queryParams );
			if ( shouldReplace ) {
				transition.method( "replace" );
			}

			return transition;
		}
	});

	// noinspection JSCommentMatchesSignature
	RouterService.reopen( /** @class RouterService */ {
		/** @type {NwjsService} */
		nwjs: service(),
		/** @type {SettingsService} */
		settings: service(),

		/**
		 * Add custom refresh logic when trying to transition to the current route
		 * @param {string} routeNameOrUrl
		 * @param {...Object?} models
		 * @param {Object?} options
		 * @returns {Transition}
		 */
		transitionTo( ...args ) {
			const [ routeNameOrUrl ] = args;

			if ( resemblesURL( routeNameOrUrl ) ) {
				return routeNameOrUrl === router.currentURL
					? this.refresh()
					: router._doURLTransition( "transitionTo", routeNameOrUrl );
			}

			if ( arguments.length === 1 && routeNameOrUrl === router.currentRouteName ) {
				return this.refresh();
			}

			const { routeName, models, queryParams } = extractRouteArgs( ...args );
			const transition = router._doTransition( routeName, models, queryParams, true );
			transition[ "_keepDefaultQueryParamValues" ] = true;

			return transition;
		},

		/**
		 * Refresh current route or go back to previous route if current route is the ErrorRoute
		 * @returns {Transition}
		 */
		refresh() {
			const { currentRouteName, errorTransition } = router;

			if ( errorTransition ) {
				return errorTransition.retry();

			} else {
				return application.lookup( `route:${currentRouteName}` ).refresh();
			}
		},

		/**
		 * @param {number} action
		 */
		history( action ) {
			window.history.go( action );
		},

		/**
		 * @param {boolean?} shouldReplace
		 * @returns {Transition}
		 */
		homepage( shouldReplace ) {
			return this[ shouldReplace ? "replaceWith" : "transitionTo" ](
				this.settings.content.gui.homepage || "/streams"
			);
		},

		/**
		 * @param {string} url
		 * @returns {Promise}
		 */
		async openBrowserOrTransitionToChannel( url ) {
			if ( !url ) { return; }

			const id = getStreamFromUrl( url );
			if ( id ) {
				return await this.transitionTo( "channel", id );
			} else {
				return await this.nwjs.openBrowser( url );
			}
		}
	});

	RouterService.on( "routeDidChange", transition => {
		if ( !transition.to || transition.sequence === -1 ) { return; }

		// unset error transition when leaving the error route
		if ( router.errorTransition && transition.routeInfos.every( info => info.isResolved ) ) {
			router.errorTransition = null;
		}
	});

	// remember the transition on error, so it can be reloaded with its parameters
	application.lookup( "route:application" ).reopen({
		actions: {
			error( error, transition ) {
				transition.abort();
				router.errorTransition = transition;
				this.intermediateTransitionTo( "error", error );
			}
		}
	});
}


export default {
	name: "routing",
	before: "application",
	initialize
};
