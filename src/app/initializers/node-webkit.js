define( [ "ember" ], function( Ember ) {

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
			title: "Livestreamer Twitch GUI",
			icon: "/img/icon-tray.png"
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


	Ember.Application.initializer({
		name: "node-webkit",

		initialize: function( container ) {
			container.register( "nw:nwGui",    nwGui,    { instantiate: false } );
			container.register( "nw:nwWindow", nwWindow, { instantiate: false } );
			container.injection( "route",      "nwGui",    "nw:nwGui" );
			container.injection( "controller", "nwGui",    "nw:nwGui" );
			container.injection( "route",      "nwWindow", "nw:nwWindow" );
			container.injection( "controller", "nwWindow", "nw:nwWindow" );
		}
	});

});
