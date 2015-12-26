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
	var reModalTemplateName = /^(?:Modal)?(\w)(\w+)(?:Modal)?$/i;

	function fnModalTemplateName( _, a, b ) {
		return "modal" + a.toUpperCase() + b;
	}

	return Ember.Route.extend({
		settings: Ember.inject.service(),

		init: function() {
			this._super();
			this.controllerFor( "versioncheck" );
			this.setupFocusRefresh();
		},

		setupFocusRefresh: function() {
			var self = this;
			var last = null;

			function focusGain() {
				var time  = get( self, "settings.gui_focusrefresh" );
				if ( !time || !last || last + time > +new Date() ) { return; }
				var name  = get( self.controller, "currentRouteName" );
				var route = self.container.lookup( "route:" + name );
				if ( name === "error" || get( route, "disableAutoRefresh" ) ) { return; }
				route.refresh();
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

			nwWindow.on( "blur", onFocusLoss );
			nwWindow.on( "minimize", onFocusLoss );
			nwWindow.on( "focus", onFocusGain );
			nwWindow.on( "restore", onFocusGain );
		},

		actions: {
			"history": function( action ) {
				window.history.go( +action );
			},

			"refresh": function() {
				var routeName = get( this.controller, "currentRouteName" );
				if ( routeName !== "error" ) {
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

			"openLivestreamer": function( stream ) {
				this.controllerFor( "livestreamer" ).startStream( stream );
			},

			"openModal": function( template, controller, data ) {
				template = template.replace( reModalTemplateName, fnModalTemplateName );

				if ( typeof controller === "string" ) {
					controller = this.controllerFor( controller );
				}
				if ( controller && data instanceof Object ) {
					controller.setProperties( data );
				}

				this.render( template, {
					into      : "application",
					outlet    : "modal",
					controller: controller
				});
			},

			"closeModal": function() {
				this.disconnectOutlet({
					parentView: "application",
					outlet    : "modal"
				});
			}
		}
	});

});
