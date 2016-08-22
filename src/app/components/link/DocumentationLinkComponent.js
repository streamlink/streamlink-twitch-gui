import Ember from "Ember";
import config from "config";
import ExternalLinkComponent from "components/link/ExternalLinkComponent";
import layout from "templates/components/link/DocumentationLinkComponent.hbs";


var get = Ember.get;

var livestreamerDocsUrl = config.livestreamer[ "docs-url" ];


export default ExternalLinkComponent.extend({
	layout,

	// default baseUrl is the livestreamer docs url
	baseUrl: livestreamerDocsUrl,

	tagName: "span",
	classNameBindings: [ ":documentation-link-component", "url:with-url" ],
	attributeBindings: [ "title" ],

	title: function() {
		return get( this, "url" )
			// keep default behavior
			? get( this, "baseUrl" ) === livestreamerDocsUrl
				? "Read the documentation of this livestreamer parameter"
				: "Read the documentation in your web browser"
			: "";
	}.property( "baseUrl", "url" ),

	url: function() {
		var baseUrl = get( this, "baseUrl" );
		var item    = get( this, "item" );
		var itemUrl = encodeURIComponent( item );

		return baseUrl.replace( "{item}", itemUrl );
	}.property( "baseUrl", "item" )
});
