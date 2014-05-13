define( [ "ember-data" ], function( DS ) {

	return DS.LSAdapter.extend({
		namespace: "app",
		defaultSerializer: DS.LSSerializer.extend()
	});

});
