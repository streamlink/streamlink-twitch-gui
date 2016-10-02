import {
	get,
	computed
} from "Ember";
import { livestreamer } from "config";
import ExternalLinkComponent from "components/link/ExternalLinkComponent";
import layout from "templates/components/link/DocumentationLinkComponent.hbs";


const { "docs-url": livestreamerDocsUrl } = livestreamer;


export default ExternalLinkComponent.extend({
	layout,

	// default baseUrl is the livestreamer docs url
	baseUrl: livestreamerDocsUrl,

	tagName: "span",
	classNameBindings: [ ":documentation-link-component", "url:with-url" ],
	attributeBindings: [ "title" ],

	title: computed( "baseUrl", "url", function() {
		return get( this, "url" )
			// keep default behavior
			? get( this, "baseUrl" ) === livestreamerDocsUrl
				? "Read the documentation of this livestreamer parameter"
				: "Read the documentation in your web browser"
			: "";
	}),

	url: computed( "baseUrl", "item", function() {
		var baseUrl = get( this, "baseUrl" );
		var item    = get( this, "item" );
		var itemUrl = encodeURIComponent( item );

		return baseUrl.replace( "{item}", itemUrl );
	})
});
