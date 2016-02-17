define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/nwWindow"
], function(
	Ember,
	nwGui,
	nwWindow
) {

	var get = Ember.get;
	var debounce = Ember.run.debounce;


	return Ember.Route.extend({
		settings    : Ember.inject.service(),
		modal       : Ember.inject.service(),
		versioncheck: Ember.inject.service(),
		livestreamer: Ember.inject.service(),


		init: function() {
			this._super();
			get( this, "versioncheck" ).check();
			this.setupFocusRefresh();
		},

		setupFocusRefresh: function() {
			var self = this;
			var last = null;
			var defer = false;

			function refresh() {
				var name  = get( self.controller, "currentRouteName" );
				var route = self.container.lookup( "route:" + name );
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
			"history": function( action ) {
				window.history.go( +action );
			},

			"refresh": function() {
				var routeName = get( this.router, "currentRouteName" );

				if ( routeName === "error" ) {
					routeName = get( this.router, "lastRouteName" );
					if ( routeName ) {
						this.transitionTo( routeName );
					}

				} else {
					this.container.lookup( "route:" + routeName ).refresh();
				}
			},

			"goto": function( routeName ) {
				var currentRoute = get( this.controller, "currentRouteName" );
				if ( routeName === currentRoute ) {
					this.send( "refresh" );
				} else {
					this.transitionTo.apply( this, arguments );
				}
			},

			"gotoHomepage": function( noHistoryEntry ) {
				var homepage = get( this, "settings.gui_homepage" );
				var method   = noHistoryEntry
					? "replaceWith"
					: "transitionTo";
				this.router[ method ]( homepage || "/featured" );
			},

			"openBrowser": function( url ) {
				nwGui.Shell.openExternal( url );
			},

			"openLivestreamer": function( stream, quality ) {
				get( this, "livestreamer" ).startStream( stream, quality );
			}
		}
	});

});
