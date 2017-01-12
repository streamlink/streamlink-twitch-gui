import {
	get,
	inject
} from "Ember";
import FormButtonComponent from "components/button/FormButtonComponent";


const { service } = inject;


export default FormButtonComponent.extend({
	chat: service(),

	classNames: [ "btn-hint" ],
	icon: "fa-comments",
	title: "Open chat",
	iconanim: true,

	action() {
		const channel = get( this, "channel" );
		const chat    = get( this, "chat" );

		return chat.open( channel );
	}
});
