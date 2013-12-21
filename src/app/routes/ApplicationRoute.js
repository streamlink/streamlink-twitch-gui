define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		beforeModel: function() {
			var store = this.store;

			// Create initial Settings record
			store.find( "settings", 1 ).then(
				// Settings already exist
				function() {},
				// Settings do not exists yet...
				function() {
					store.createRecord( "settings", { id: 1 } ).save();
				}
			);
		},

		actions: {
			"open_livestreamer": function( stream ) {
				this.store.find( "settings", 1 ).then(function( settings ) {
					var	path = settings.get( "livestreamer" ),
						qualities = settings.get( "qualities" ),
						quality = settings.get( "quality" );

					require( "child_process" ).spawn(
						path.length ? path : "livestreamer",
						[
							stream.channel.url,
							qualities.hasOwnProperty( quality )
								? qualities[ quality ].quality
								: qualities[ 0 ].quality
						]
					);
				});
			}
		}
	});

});
