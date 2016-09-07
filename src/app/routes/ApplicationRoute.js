import {
	get,
	set,
	getOwner,
	inject,
	run,
	Route
} from "Ember";
import nwWindow from "nwjs/nwWindow";
import openBrowser from "nwjs/openBrowser";
import getStreamFromUrl from "utils/getStreamFromUrl";


const { service } = inject;
const { debounce } = run;


export default Route.extend({
	livestreamer: service(),
	modal: service(),
	settings: service(),
	versioncheck: service(),


	init() {
		this._super();
		get( this, "versioncheck" ).check();
		this.setupFocusRefresh();
	},

	setupFocusRefresh() {
		var self = this;
		var last = null;
		var defer = false;

		function refresh() {
			var name  = get( self.controller, "currentRouteName" );
			var route = getOwner( self ).lookup( `route:${name}` );
			if ( name === "error" || get( route, "disableAutoRefresh" ) ) { return; }
			route.refresh();
		}

		function focusGain() {
			var time  = get( self, "settings.gui_focusrefresh" );
			if ( !time || !last || last + time > +new Date() ) { return; }
			// defer the refresh if a modal dialog is opened
			if ( get( self, "modal.isModalOpened" ) ) {
				defer = true;
			} else {
				refresh();
			}
		}

		function focusLoss() {
			last = +new Date();
		}

		function onFocusGain() {
			// ignore multiple events (minimize+blur or restore+focus)
			debounce( focusGain, 20 );
		}

		function onFocusLoss() {
			debounce( focusLoss, 20 );
		}

		function modalObserver() {
			// the modal dialog has just been closed
			if ( !get( self, "modal.isModalOpened" ) && defer ) {
				refresh();
			}
			defer = false;
		}

		nwWindow.on( "blur", onFocusLoss );
		nwWindow.on( "minimize", onFocusLoss );
		nwWindow.on( "focus", onFocusGain );
		nwWindow.on( "restore", onFocusGain );

		this.addObserver( "modal.isModalOpened", modalObserver );
	},


	actions: {
		error( error, transition ) {
			transition.abort();
			set( this, "router.errorTransition", transition );
			return true;
		},

		history( action ) {
			window.history.go( +action );
		},

		refresh() {
			var routeName = get( this, "router.currentRouteName" );

			if ( routeName === "error" ) {
				var errorTransition = get( this, "router.errorTransition" );
				if ( errorTransition ) {
					set( this, "router.errorTransition", null );
					errorTransition.retry();

				} else {
					routeName = get( this, "router.lastRouteName" );
					if ( routeName ) {
						this.transitionTo( routeName );
					}
				}

			} else {
				getOwner( this ).lookup( `route:${routeName}` ).refresh();
			}
		},

		goto( routeName ) {
			var currentRoute = get( this, "controller.currentRouteName" );
			if ( routeName === currentRoute ) {
				this.send( "refresh" );
			} else {
				this.transitionTo.apply( this, arguments );
			}
		},

		gotoHomepage( noHistoryEntry ) {
			var homepage = get( this, "settings.gui_homepage" );
			var method   = noHistoryEntry
				? "replaceWith"
				: "transitionTo";
			this.router[ method ]( homepage || "/featured" );
		},

		openBrowser( url ) {
			var stream = getStreamFromUrl( url );
			if ( stream ) {
				this.send( "goto", "channel", stream );
			} else {
				openBrowser( url );
			}
		}
	}
});
