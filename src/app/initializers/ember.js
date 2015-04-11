define([
	"ember",
	"utils/ember/inflector",
	"utils/ember/helpers"
], function( Ember, inflector, helpers ) {

	Ember.$.extend( true, Ember.Inflector.inflector.rules, inflector );

	Ember.Application.initializer({
		name: "helpers",

		initialize: function() {
			Object.keys( helpers ).forEach(function( name ) {
				Ember.Handlebars.helper( name, helpers[ name ] );
			});
		}
	});

});
