define([
	"ember",
	"text!templates/about.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-about" ],

		dependencies: function() {
			var deps = this.get( "context.metadata.dependencies" );
			return Object.keys( deps ).map(function( key ) {
				return {
					title  : key,
					version: deps[ key ]
				};
			});
		}.property( "context.metadata.dependencies" )
	});

});
