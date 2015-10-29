define([
	"Ember",
	"components/ExternalLinkComponent",
	"hbs!templates/components/LivestreamerDocsComponent.html"
], function(
	Ember,
	ExternalLinkComponent,
	layout
) {

	var get = Ember.get;

	return ExternalLinkComponent.extend({
		metadata: Ember.inject.service(),

		layout: layout,

		tagName: "span",
		classNameBindings: [ ":docs" ],
		attributeBindings: [ "title" ],
		title: "Read the documentation of this livestreamer parameter",

		url: function() {
			var url = get( this, "metadata.config.livestreamer-docs-url" );
			var cmd = get( this, "cmd" );

			return url.replace( "{cmd}", cmd );
		}.property( "cmd" )
	});

});
