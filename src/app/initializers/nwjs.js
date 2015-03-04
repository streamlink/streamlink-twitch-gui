define( [ "ember", "./metadata", "utils/semver" ], function( Ember, metadata, semver ) {

	var	nwGui       = window.nwDispatcher.requireNwGui(),
		nwWindow    = nwGui.Window.get(),

		trayIcon    = null,
		isHidden    = false,
		isMaximized = false,
		isMinimized = false,

		trayTooltip = metadata.package.config[ "display-name" ],
		trayIconImg = (function getTrayIconRes() {
			var	dpr	= window.devicePixelRatio,
				res	= process.platform !== "darwin" || dpr > 2
					? 48
					: dpr > 1
						? 32
						: 16;
			return metadata.package.config[ "tray-icon" ].replace( "{res}", res );
		})(),
		trayMenu    = (function() {
			var menu = new nwGui.Menu();

			menu.taskbar = true;
			menu.toggleVisibility = function() {
				nwWindow.toggleVisibility();
				// also toggle taskbar visiblity on click (gui_integration === both)
				if ( menu.taskbar ) {
					nwWindow.setShowInTaskbar( !isHidden );
				}
			};

			menu.append( new nwGui.MenuItem({
				label: "Toggle visibility",
				click: menu.toggleVisibility
			}));

			menu.append( new nwGui.MenuItem({
				label: "Close application",
				click: function() {
					nwWindow.close();
				}
			}));

			return menu;
		})();


	var OS   = require( "os" );
	var win8 = "6.2.0";

	if (
		// check if current platform is windows
		   /^win/.test( process.platform )
		// check if windows version is >= 8
		&& semver.sort([ OS.release(), win8 ]).shift() === win8
	) {
		// register AppUserModelID
		// this is required for toast notifications on windows 8+
		// https://github.com/rogerwang/node-webkit/wiki/Notification#windows
		var shortcut = "%@\\Microsoft\\Windows\\Start Menu\\Programs\\%@.lnk".fmt(
			process.env.APPDATA,
			Ember.get( metadata, "package.config.display-name" )
		);
		nwGui.App.createShortcut( shortcut );
	}


	function removeTrayIcon() {
		if ( trayIcon ) {
			trayIcon.remove();
			trayIcon = null;
		}
	}

	window.addEventListener( "beforeunload", function() {
		// remove all listeners
		nwWindow.removeAllListeners();
		process.removeAllListeners();
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
			trayIcon = new nwGui.Tray({ icon: trayIconImg });
			trayIcon.tooltip = trayTooltip;
			trayIcon.menu = trayMenu;
			trayIcon.iconsAreTemplates = false;
			trayIcon.on( "click", trayMenu.toggleVisibility );
			trayMenu.taskbar = taskbar;
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
		name: "nwjs",

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
					nwWindow.toggleVisibility( true );
					nwWindow.focus();
					container.lookup( "controller:application" ).send( "winClose" );
				} catch ( e ) {
					this.close( true );
				}
			});
		}
	});

});
