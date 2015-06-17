define([
	"Ember",
	"text!templates/about.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;

	return Ember.View.extend({
		metadata: Ember.inject.service(),

		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-about" ],

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
