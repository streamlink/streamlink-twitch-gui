import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


function actionFactory( action ) {
	return function( success, failure ) {
		this.modalContext.send( action, success, failure );
	};
}


export default ModalDialogComponent.extend({
	layout,

	"class": "modal-confirm",

	hotkeysNamespace: "modalconfirm",
	hotkeys: {
		confirm: "apply"
	},


	actions: {
		"apply"  : actionFactory( "apply" ),
		"discard": actionFactory( "discard" ),
		"cancel" : actionFactory( "cancel" )
	}
});
