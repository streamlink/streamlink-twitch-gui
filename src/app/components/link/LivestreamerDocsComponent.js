define([
	"Ember",
	"config",
	"components/link/ExternalLinkComponent",
	"hbs!templates/components/link/LivestreamerDocsComponent"
], function(
	Ember,
	config,
	ExternalLinkComponent,
	layout
) {

	var get = Ember.get;

	var livestreamerDocsUrl = config.livestreamer[ "docs-url" ];


	return ExternalLinkComponent.extend({
		layout: layout,

		tagName: "span",
		classNames: [ "livestreamer-docs-component" ],
		attributeBindings: [ "title" ],
		title: "Read the documentation of this livestreamer parameter",

		url: function() {
			var url = livestreamerDocsUrl;
			var cmd = get( this, "cmd" );

			return url.replace( "{cmd}", cmd );
		}.property( "cmd" )
	});

});
