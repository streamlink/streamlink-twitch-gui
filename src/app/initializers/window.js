define( [ "nwGui", "nwWindow", "ember" ], function( nwGui, nwWindow, Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	var ismaximize = false;

	function deferEvent( fn ) {
		return function() {
			var args = arguments;
			setTimeout(function() {
				fn.apply( null, args );
			}, 10 );
		};
	}

	var timeout = null;
	function delegateSave() {
		clearTimeout( timeout );
		timeout = setTimeout( this.save.bind( this ), 100 );
	}

	function onResize( width, height ) {
		if ( ismaximize ) { return; }
		set( this, "width", width );
		set( this, "height", height );
		delegateSave.call( this );
	}

	function onMove( x, y ) {
		if ( ismaximize ) { return; }
		set( this, "x", x );
		set( this, "y", y );
		delegateSave.call( this );
	}

	function onMaximize() {
		ismaximize = true;
		setTimeout( function() {
			ismaximize = false;
		}, 20 );
	}


	function restoreWindow( nwWindow ) {
		var width  = get( this, "width" ),
		    height = get( this, "height" );
		if ( width !== null && height !== null ) {
			nwWindow.resizeTo( width, height );
		}

		var x = get( this, "x" ),
		    y = get( this, "y" );
		if ( x !== null && y !== null ) {
			nwWindow.moveTo( x, y );
		}
	}

	function resetWindow() {
		set( this, "width", null );
		set( this, "height", null );
		set( this, "x", null );
		set( this, "y", null );
		this.save();
	}


	Ember.Application.initializer({
		name: "window",
		after: [ "store", "nwjs" ],

		initialize: function( container, application ) {
			var store = container.lookup( "store:main" );

			// wait for the promise to resolve first
			application.deferReadiness();

			store.find( "window" )
				.then(function( records ) {
					return records.content.length
						? records.objectAt( 0 )
						: store.createRecord( "window", { id: 1 } ).save();
				})
				.then(function( Window ) {
					container.register( "record:window", Window, { instantiate: false } );

					// reset window
					if ( nwGui.App.fullArgv.indexOf( "--reset-window" ) >= 0 ) {
						resetWindow.call( Window );
					} else {
						restoreWindow.call( Window, nwWindow );
					}

					// also listen for the maximize events
					// we don't want to save the window size+pos after these events
					nwWindow.on(   "maximize", onMaximize );
					nwWindow.on( "unmaximize", onMaximize );

					// resize and move events need to be defered
					// the maximize events are triggered afterwards
					nwWindow.on( "resize", deferEvent( onResize.bind( Window ) ) );
					nwWindow.on(   "move", deferEvent(   onMove.bind( Window ) ) );

					// now we're ready
					application.advanceReadiness();
				});
		}
	});

});
