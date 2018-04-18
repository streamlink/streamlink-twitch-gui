import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { streaming as streamingConfig } from "config";
import ExternalLinkComponent from "../external-link/component";
import layout from "./template.hbs";
import "./styles.less";


const { "docs-url": docsUrl } = streamingConfig;


export default ExternalLinkComponent.extend({
	i18n: service(),
	settings: service(),

	layout,

	// default baseUrl
	baseUrl: computed( "settings.streaming.providerType", function() {
		const type = get( this, "settings.streaming.providerType" );

		return docsUrl[ type ];
	}),

	tagName: "span",
	classNameBindings: [
		":documentation-link-component",
		"url:with-url",
		"class"
	],
	attributeBindings: [
		"title"
	],

	class: "",
	title: computed( "i18n.locale", "baseUrl", function() {
		return get( this, "baseUrl" )
			? get( this, "i18n" ).t( "components.documentation-link.title" )
			: "";
	}),

	url: computed( "baseUrl", "item", function() {
		const baseUrl = get( this, "baseUrl" );
		const item = get( this, "item" );
		let itemUrl = encodeURIComponent( item );

		// remove leading double dash from Streamlink documentation links
		if ( get( this, "settings.streaming.isStreamlink" ) ) {
			itemUrl = itemUrl.replace( /^-/, "" );
		}

		return baseUrl.replace( "{item}", itemUrl );
	})
});
