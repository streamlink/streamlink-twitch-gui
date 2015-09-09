define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Controller.extend({
		metadata: Ember.inject.service(),

		dependencies: function() {
			var deps = get( this, "metadata.dependencies" );
			return Object.keys( deps ).map(function( key ) {
				return {
					title  : key,
					version: deps[ key ]
				};
			});
		}.property( "metadata.dependencies" )
	});

});
