define( [ "nwWindow", "ember" ], function( nwWindow, Ember ) {

	Ember.Application.initializer({
		name: "settings",
		after: [ "store", "nwjs" ],

		initialize: function( container, application ) {
			var store = container.lookup( "store:main" );

			// wait for the promise to resolve first
			application.deferReadiness();

			store.find( "settings" )
				.then(function( records ) {
					return records.content.length
						? records.objectAt( 0 )
						: store.createRecord( "settings", { id: 1 } ).save();
				})
				.then(function( settings ) {
					container.register( "record:settings", settings, { instantiate: false } );
					container.injection( "route",      "settings", "record:settings" );
					container.injection( "controller", "settings", "record:settings" );

					// tell the window how to behave
					function onIntegrationChange() {
						nwWindow.changeIntegrations(
							Ember.get( settings, "isVisibleInTaskbar" ),
							Ember.get( settings, "isVisibleInTray" )
						);
					}
					Ember.addObserver( settings, "gui_integration", onIntegrationChange );
					onIntegrationChange();

					// now we're ready
					application.advanceReadiness();
				});
		}
	});

});
