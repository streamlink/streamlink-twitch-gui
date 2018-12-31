import { get } from "@ember/object";
import ModalDialogComponent from "../modal-dialog/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import layout from "./template.hbs";


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
			key: "Enter",
			action: "apply"
		}
	],


	actions: {
		"apply"  : actionFactory( "apply" ),
		"discard": actionFactory( "discard" ),
		"cancel" : actionFactory( "cancel" )
	}
});
