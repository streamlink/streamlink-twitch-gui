define([
	"nwGui",
	"nwWindow",
	"ember",
	"./metadata",
	"nwjs/shortcut",
	"nwjs/tray",
	"nwjs/menu"
], function(
	nwGui,
	nwWindow,
	Ember,
	metadata,
	shortcut,
	tray,
	menu
) {

	var get = Ember.get;

	window.addEventListener( "beforeunload", function() {
		// remove all listeners
		nwWindow.removeAllListeners();
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


		// parse process arguments
		var argv = nwGui.App.fullArgv;

		// hide in tray
		if ( contains.call( argv, "--tray", "--hide", "--hidden" ) ) {
			nwWindow.setShowInTray( true, get( settings, "isVisibleInTaskbar" ) );
			// remove the tray icon after clicking it if it's disabled in the settings
			if ( !get( settings, "isVisibleInTray" ) ) {
				tray.tray.once( "click", tray.remove.bind( tray ) );
			}
		} else {
			nwWindow.toggleVisibility( true );
		}

		// minimize window
		if ( contains.call( argv, "--min", "--minimize", "--minimized" ) ) {
			nwWindow.toggleMinimize( false );
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
		name: "nwjs",

		initialize: function( container ) {
			var displayName = Ember.get( metadata, "package.config.display-name" );
			var trayIconImg = Ember.get( metadata, "package.config.tray-icon" );

			shortcut.create( displayName );
			tray.init( displayName, trayIconImg );
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
					container.lookup( "controller:application" ).send( "winClose" );
				} catch ( e ) {
					nwWindow.close( true );
				}
			});
		}
	});


	function contains() {
		for ( var e, j, i = 0, l = this.length << 0, n = arguments.length; i < l; ) {
			for ( e = this[i++], j = 0; j < n; ) {
				if ( e === arguments[j++] ) { return true; }
			}
		}
		return false;
	}

});
