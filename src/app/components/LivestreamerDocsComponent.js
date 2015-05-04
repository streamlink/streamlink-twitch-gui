define([
	"ember",
	"components/ExternalLinkComponent",
	"text!templates/components/livestreamerdocs.html.hbs"
], function( Ember, ExternalLinkComponent, layout ) {

	return ExternalLinkComponent.extend({
		layout: Ember.HTMLBars.compile( layout ),

		tagName: "span",
		classNameBindings: [ ":docs" ],
		attributeBindings: [ "title" ],
		title: "Read the documentation of this livestreamer parameter",

		url: function() {
			return this.container.lookup( "controller:application" )
				.get( "metadata.package.config.livestreamer-docs-url" )
				.replace( "{cmd}", this.get( "cmd" ) );
		}.property( "cmd" )
	});

});
