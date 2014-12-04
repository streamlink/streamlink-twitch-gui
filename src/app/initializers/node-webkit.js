define( [ "ember", "./metadata" ], function( Ember, metadata ) {

	var	nwGui       = window.nwDispatcher.requireNwGui(),
		nwWindow    = nwGui.Window.get(),

		trayIcon    = null,
		isHidden    = false,
		isMaximized = false,
		isMinimized = false;


	function removeTrayIcon() {
		if ( trayIcon ) {
			trayIcon.remove();
			trayIcon = null;
		}
	}

	window.addEventListener( "beforeunload", function() {
		// remove all listeners
		nwWindow.removeAllListeners();
		// prevent tray icons from stacking up when refreshing the page or devtools
		removeTrayIcon();
	}, false );


	nwWindow.on( "maximize",   function onMaximize()   { isMaximized = true;  } );
	nwWindow.on( "unmaximize", function onUnmaximize() { isMaximized = false; } );
	nwWindow.on( "minimize",   function onMinimize()   { isMinimized = true;  } );
	nwWindow.on( "restore",    function onRestore()    { isMinimized = false; } );


	nwWindow.toggleMaximize = function toggleMaximize( bool ) {
		if ( bool === undefined ) { bool = isMaximized; }
		nwWindow[ bool ? "unmaximize" : "maximize" ]();
	};

	nwWindow.toggleMinimize = function toggleMinimize( bool ) {
		if ( bool === undefined ) { bool = isMinimized; }
		nwWindow[ bool ? "restore" : "minimize" ]();
	};

	nwWindow.toggleVisibility = function toggleVisibility( bool ) {
		if ( bool === undefined ) { bool = isHidden; }
		nwWindow[ bool ? "show" : "hide" ]();
		isHidden = !bool;
	};


	nwWindow.setShowInTray = function setShowInTray( bool, taskbar ) {
		// always remove the tray icon...
		// we need a new click event listener in case the taskbar param has changed
		removeTrayIcon();
		if ( bool ) {
			trayIcon = new nwGui.Tray({
				title: metadata.package.config[ "display-name" ],
				icon: metadata.package.config[ "tray-icon" ]
			});
			trayIcon.on( "click", function() {
				nwWindow.toggleVisibility();
				// also toggle taskbar visiblity on click (gui_integration === both)
				if ( taskbar ) {
					nwWindow.setShowInTaskbar( !isHidden );
				}
			});
		}
	};

	nwWindow.changeIntegrations = function changeIntegrations( taskbar, tray ) {
		nwWindow.setShowInTaskbar( taskbar );
		nwWindow.setShowInTray( tray, taskbar );
	};


	nwWindow.cookiesRemoveAll = function cookiesRemoveAll() {
		var Cookies = nwWindow.cookies;
		Cookies.getAll( {}, function( cookies ) {
			[].forEach.call( cookies, function( c ) {
				Cookies.remove({
					url: "http" + ( c.secure ? "s" : "" ) + "://" + c.domain + c.path,
					name: c.name
				});
			});
		});
	};


	Ember.Application.initializer({
		name: "node-webkit",

		initialize: function( container ) {
			// inject nwGui and nwWindow into all routes and controllers
			container.register( "nw:nwGui",    nwGui,    { instantiate: false } );
			container.register( "nw:nwWindow", nwWindow, { instantiate: false } );
			container.injection( "route",      "nwGui",    "nw:nwGui" );
			container.injection( "controller", "nwGui",    "nw:nwGui" );
			container.injection( "route",      "nwWindow", "nw:nwWindow" );
			container.injection( "controller", "nwWindow", "nw:nwWindow" );

			// listen for the close event and show the dialog instead of strictly shutting down
			nwWindow.on( "close", function() {
				if ( location.pathname !== "/index.html" ) {
					return this.close( true );
				}

				try {
					nwWindow.focus();
					container.lookup( "controller:application" ).send( "winClose" );
				} catch ( e ) {
					this.close( true );
				}
			});
		}
	});

});
