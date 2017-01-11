import {
	get,
	inject
} from "Ember";
import FormButtonComponent from "components/button/FormButtonComponent";


const { service } = inject;


export default FormButtonComponent.extend({
	chat: service(),

	"class" : "btn-hint",
	icon    : "fa-comments",
	title   : "Open chat",
	iconanim: true,

	action( success, failure ) {
		const channel = get( this, "channel" );
		const chat    = get( this, "chat" );

		chat.open( channel )
			.then( success, failure )
			.catch( () => {} );
	}
});
