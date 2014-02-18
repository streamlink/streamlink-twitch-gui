define( [ "ember" ], function( Ember ) {

	var nwGui, nwWindow, maximized;
	if ( window.process && window.process.env ) {
		nwGui = window.nwDispatcher.requireNwGui();
		nwWindow = nwGui.Window.get();
		nwWindow.on( "maximize",   function() { maximized = true;  } );
		nwWindow.on( "unmaximize", function() { maximized = false; } );
	}


	return Ember.Controller.extend({
		needs: [ "livestreamer" ],

		dev: "@@@dev@@@" !== "false",

		nwGui: nwGui,
		nwWindow: nwWindow,

		actions: {
			"history": function( action ) {
				window.history.go( +action );
			},

			"goto": function( where ) {
				console.log( this );
				this.target.router.transitionTo( where );
			},

			"winRefresh": function() {
				nwWindow && nwWindow.reloadIgnoringCache();
			},

			"winDevTools": function() {
				nwWindow && nwWindow.showDevTools()
			},

			"winMin": function() {
				nwWindow && nwWindow.minimize();
			},

			"winMax": function() {
				nwWindow && nwWindow[ maximized ? "unmaximize" : "maximize" ]();
			},

			"winClose": function() {
				nwWindow && nwWindow.close();
			},

			"fork": function() {
				this.send( "open_browser", this.get( "model.package.homepage" ) );
			}
		}
	});

});
