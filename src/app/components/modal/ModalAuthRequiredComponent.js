import ModalDialogComponent from "components/modal/ModalDialogComponent";
import layout from "templates/components/modal/ModalAuthRequiredComponent.hbs";


export default ModalDialogComponent.extend({
	layout,

	"class": "modal-auth-required",

	goto: "goto",


	actions: {
		login() {
			this.sendAction( "goto", "user.auth" );
			this.send( "close" );
		}
	}
});
