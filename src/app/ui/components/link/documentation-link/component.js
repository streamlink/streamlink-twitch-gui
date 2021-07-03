import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { streaming as streamingConfig } from "config";
import ExternalLinkComponent from "../external-link/component";
import layout from "./template.hbs";
import "./styles.less";


const { "docs-url": docsUrl } = streamingConfig;


export default ExternalLinkComponent.extend({
	/** @type {IntlService} */
	intl: service(),
	/** @type {SettingsService} */
	settings: service(),

	layout,

	// default baseUrl
	baseUrl: computed( "settings.content.streaming.providerType", function() {
		return docsUrl[ this.settings.content.streaming.providerType ];
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
	title: computed( "intl.locale", "baseUrl", function() {
		return this.baseUrl
			? this.intl.t( "components.documentation-link.title" )
			: "";
	}),

	url: computed( "baseUrl", "item", function() {
		const { baseUrl, item } = this;

		if ( !baseUrl ) {
			return null;
		}

		let itemUrl = encodeURIComponent( item );

		// remove leading double dash from Streamlink documentation links
		if ( this.settings.content.streaming.isStreamlink ) {
			itemUrl = itemUrl.replace( /^-/, "" );
		}

		return baseUrl.replace( "{item}", itemUrl );
	})
});
