define( [ "ember", "utils/helpers" ], function( Ember, helpers ) {

	Ember.Application.initializer({
		name: "helpers",

		initialize: function() {
			Object.keys( helpers ).forEach(function( name ) {
				Ember.Handlebars.helper( name, helpers[ name ] );
			});
		}
	});

});
