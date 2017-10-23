import {
	get,
	computed,
	inject
} from "ember";
import {
	streaming as streamingConfig
} from "config";
import ExternalLinkComponent from "components/link/ExternalLinkComponent";
import layout from "templates/components/link/DocumentationLinkComponent.hbs";


const { service } = inject;
const {
	providers,
	"docs-url": docsUrl
} = streamingConfig;


export default ExternalLinkComponent.extend({
	layout,

	settings: service(),

	// default baseUrl
	baseUrl: computed( "settings.streamprovider", function() {
		let streamprovider = get( this, "settings.streamprovider" );
		let type = providers[ streamprovider ].type;

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
	title: computed( "baseUrl", function() {
		let baseUrl = get( this, "baseUrl" );

		return baseUrl
			? "Read the documentation in your web browser"
			: "";
	}),

	url: computed( "baseUrl", "item", function() {
		const baseUrl = get( this, "baseUrl" );
		const item = get( this, "item" );
		let itemUrl = encodeURIComponent( item );

		// remove leading double dash on Streamlink documentation links
		let streamprovider = get( this, "settings.streamprovider" );
		if ( providers[ streamprovider ].type === "streamlink" ) {
			itemUrl = itemUrl.replace( /^-/, "" );
		}

		return baseUrl.replace( "{item}", itemUrl );
	})
});
