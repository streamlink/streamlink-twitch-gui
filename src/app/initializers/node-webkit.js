define( [ "ember", "./metadata" ], function( Ember, metadata ) {

	var	nwGui		= window.nwDispatcher.requireNwGui(),
		nwWindow	= nwGui.Window.get(),
		maximized,
		tray;

	nwWindow.on( "maximize",   function onMaximize()   { maximized = true;  } );
	nwWindow.on( "unmaximize", function onUnmaximize() { maximized = false; } );

	nwWindow.toggleMaximize = function toggleMaximize() {
		if ( maximized ) { nwWindow.unmaximize(); }
		else { nwWindow.maximize(); }
	};

	nwWindow.winToTray = function winToTray() {
		if ( tray ) { return; }

		tray = new nwGui.Tray({
			title: metadata.package.config[ "display-name" ],
			icon: metadata.package.config[ "tray-icon" ]
		}).on( "click", nwWindow.winFromTray );

		nwWindow.hide();
		nwWindow.setShowInTaskbar( false );
	};

	nwWindow.winFromTray = function winFromTray() {
		if ( !tray ) { return; }

		nwWindow.show();
		nwWindow.setShowInTaskbar( true );

		tray.remove();
		tray = null;
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
					container.lookup( "controller:application" ).send( "winClose" );
				} catch ( e ) {
					this.close( true );
				}
			});
		}
	});

});
