import { get } from "Ember";
import { set as setClipboard } from "nwjs/clipboard";
import FormButtonComponent from "components/button/FormButtonComponent";


export default FormButtonComponent.extend({
	"class" : "btn-info",
	icon    : "fa-share-alt",
	title   : "Copy channel url to clipboard",
	iconanim: true,

	action: "share",

	actions: {
		"share": function( success, failure ) {
			setClipboard( get( this, "channel.url" ) )
				.then( success, failure )
				.catch(function() {});
		}
	}
});
