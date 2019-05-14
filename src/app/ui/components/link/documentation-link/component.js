import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { attribute, className, classNames, layout, tagName } from "@ember-decorators/component";
import { streaming as streamingConfig } from "config";
import ExternalLinkComponent from "../external-link/component";
import template from "./template.hbs";
import "./styles.less";


const { "docs-url": docsUrl } = streamingConfig;


@layout( template )
@tagName( "span" )
@classNames( "documentation-link-component" )
export default class DocumentationLinkComponent extends ExternalLinkComponent {
	/** @type {I18nService} */
	@service i18n;
	/** @type {SettingsService} */
	@service settings;

	@className
	class = "";

	_baseUrl = null;

	@computed( "settings.content.streaming.providerType" )
	get baseUrl() {
		return this._baseUrl !== null
			? this._baseUrl
			: docsUrl[ this.settings.content.streaming.providerType ];
	}
	set baseUrl( value ) {
		this._baseUrl = value;
	}

	@attribute
	@computed( "i18n.locale", "baseUrl" )
	get title() {
		return this.baseUrl
			? this.i18n.t( "components.documentation-link.title" )
			: "";
	}

	@className( "with-url" )
	@computed( "baseUrl", "item" )
	get url() {
		let itemUrl = encodeURIComponent( this.item );

		// remove leading double dash from Streamlink documentation links
		if ( !this._baseUrl && this.settings.content.streaming.isStreamlink ) {
			itemUrl = itemUrl.replace( /^-/, "" );
		}

		return this.baseUrl.replace( "{item}", itemUrl );
	}
}
