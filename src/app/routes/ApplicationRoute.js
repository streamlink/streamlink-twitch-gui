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
		}
	});

});
