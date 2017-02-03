import {
	get,
	computed,
	inject
} from "Ember";
import { streamprovider } from "config";
import ExternalLinkComponent from "components/link/ExternalLinkComponent";
import layout from "templates/components/link/DocumentationLinkComponent.hbs";


const { service } = inject;
const {
	providers,
	"docs-url": docsUrl
} = streamprovider;


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
		var baseUrl = get( this, "baseUrl" );
		var item    = get( this, "item" );
		var itemUrl = encodeURIComponent( item );

		return baseUrl.replace( "{item}", itemUrl );
	})
});
