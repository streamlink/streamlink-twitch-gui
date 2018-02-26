import { get } from "@ember/object";
import ModalDialogComponent from "./ModalDialogComponent";
import HotkeyMixin from "../mixins/hotkey";
import layout from "templates/components/modal/ModalConfirmComponent.hbs";


function actionFactory( action ) {
	return function( success, failure ) {
		get( this, "modal.context" ).send( action, success, failure );
	};
}


export default ModalDialogComponent.extend( HotkeyMixin, {
	layout,

	"class": "modal-confirm",

	hotkeys: [
		{
			code: [ "Enter", "NumpadEnter" ],
			action: "apply"
		}
	],


	actions: {
		"apply"  : actionFactory( "apply" ),
		"discard": actionFactory( "discard" ),
		"cancel" : actionFactory( "cancel" )
	}
});
