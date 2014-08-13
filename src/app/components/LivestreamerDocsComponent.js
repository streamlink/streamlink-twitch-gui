define( [ "ember", "components/ExternalLinkComponent" ], function( Ember, ExternalLinkComponent ) {

	return ExternalLinkComponent.extend({
		layout: Ember.Handlebars.compile( "{{cmd}}" ),

		tagName: "span",
		classNameBindings: [ ":docs" ],
		attributeBindings: [ "title" ],
		title: "See the livestreamer documentation for this command",

		url: function() {
			return this.container.lookup( "controller:application" )
				.get( "model.package.config.livestreamer-docs-url" )
				.replace( "{cmd}", this.get( "cmd" ) );
		}.property( "cmd" )
	});

});
