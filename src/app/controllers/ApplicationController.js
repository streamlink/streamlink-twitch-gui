define( [ "ember" ], function( Ember ) {

	var nw_window, maximized;
	if ( window.process && window.process.env ) {
		nw_window = window.nwDispatcher.requireNwGui().Window.get();
		nw_window.on( "maximize",   function() { maximized = true;  } );
		nw_window.on( "unmaximize", function() { maximized = false; } );
	}


	return Ember.Controller.extend({
		dev: "@@@dev@@@" !== "false",

		actions: {
			"winRefresh": function() {
				nw_window && nw_window.reloadIgnoringCache();
			},
			"winDevTools": function() {
				nw_window && nw_window.showDevTools()
			},
			"winMin": function() {
				nw_window && nw_window.minimize();
			},
			"winMax": function() {
				nw_window && nw_window[ maximized ? "unmaximize" : "maximize" ]();
			},
			"winClose": function() {
				nw_window && nw_window.close();
			},
			"fork": function() {
				( nw_window
					? window.nwDispatcher.requireNwGui().Shell.openExternal
					: window.open
				)( "@@@repository@@@" );
			}
		}
	});

});
