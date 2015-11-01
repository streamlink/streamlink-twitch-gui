define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/nwWindow",
	"nwjs/nwScreen",
	"nwjs/shortcut",
	"nwjs/tray",
	"nwjs/menu",
	"nwjs/argv"
], function(
	Ember,
	nwGui,
	nwWindow,
	nwScreen,
	shortcut,
	tray,
	menu,
	argv
) {

	var get = Ember.get;

	window.addEventListener( "beforeunload", function() {
		// remove all listeners
		nwWindow.removeAllListeners();
		nwScreen.removeAllListeners();
		process.removeAllListeners();
		// prevent tray icons from stacking up when refreshing the page or devtools
		tray.remove();
	}, false );


	var isHidden    = true;
	var isMaximized = false;
	var isMinimized = false;

	nwWindow.on( "maximize",   function onMaximize()   { isMaximized = true;  } );
	nwWindow.on( "unmaximize", function onUnmaximize() { isMaximized = false; } );
	nwWindow.on( "minimize",   function onMinimize()   { isMinimized = true;  } );
	nwWindow.on( "restore",    function onRestore()    { isMinimized = false; } );


	nwWindow.on( "ready", function onReady( settings ) {
		// taskbar and tray OS integrations
		function onIntegrationChange() {
			var taskbar = get( settings, "isVisibleInTaskbar" );
			var tray    = get( settings, "isVisibleInTray" );
			nwWindow.setShowInTaskbar( taskbar );
			nwWindow.setShowInTray( tray, taskbar );
		}
		// observe the settings record
		Ember.addObserver( settings, "gui_integration", onIntegrationChange );
		onIntegrationChange();


		// hide in tray
		if ( argv.tray ) {
			nwWindow.setShowInTray( true, get( settings, "isVisibleInTaskbar" ) );
			// remove the tray icon after clicking it if it's disabled in the settings
			if ( !get( settings, "isVisibleInTray" ) ) {
				tray.tray.once( "click", tray.remove.bind( tray ) );
			}
		} else {
			nwWindow.toggleVisibility( true );
		}

		// minimize window
		if ( argv.min ) {
			nwWindow.toggleMinimize( false );
		}

		if ( DEBUG ) {
			window.initialized = true;
		}
	});


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
		tray.remove();
		if ( bool ) {
			tray.add(function() {
				nwWindow.toggleVisibility();
				// also toggle taskbar visiblity on click (gui_integration === both)
				if ( taskbar ) {
					nwWindow.setShowInTaskbar( !isHidden );
				}
			});
		}
	};


	Ember.Application.instanceInitializer({
		name: "nwjs",

		initialize: function( application ) {
			var metadata = application.lookup( "service:metadata" );

			var displayName    = get( metadata, "config.display-name" );
			var trayIconImg    = get( metadata, "config.tray-icon" );
			var trayIconImgOSX = get( metadata, "config.tray-icon-osx" );

			shortcut.createShortcut( displayName );
			tray.init( displayName, trayIconImg, trayIconImgOSX );
			if ( process.platform === "darwin" ) {
				menu.createMacNativeMenuBar( displayName );
			}


			// listen for the close event and show the dialog instead of strictly shutting down
			nwWindow.on( "close", function() {
				if ( location.pathname !== "/index.html" ) {
					return nwWindow.close( true );
				}

				try {
					nwWindow.show();
					nwWindow.focus();
					application.lookup( "controller:application" ).send( "winClose" );
				} catch ( e ) {
					nwWindow.close( true );
				}
			});
		}
	});

});
