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

		dev: DEBUG,

		nwGui: nwGui,
		nwWindow: nwWindow,

		actions: {
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
			}
		}
	});

});
