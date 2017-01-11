import { get } from "Ember";
import { set as setClipboard } from "nwjs/Clipboard";
import FormButtonComponent from "components/button/FormButtonComponent";


export default FormButtonComponent.extend({
	"class" : "btn-info",
	icon    : "fa-share-alt",
	title   : "Copy channel url to clipboard",
	iconanim: true,

	action( success, failure ) {
		const url = get( this, "channel.url" );

		setClipboard( url )
			.then( success, failure )
			.catch( () => {} );
	}
});
