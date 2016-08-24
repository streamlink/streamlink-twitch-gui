import Ember from "Ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import layout from "templates/components/modal/ModalConfirmComponent.hbs";


var get = Ember.get;

function actionFactory( action ) {
	return function( success, failure ) {
		get( this, "modal.context" ).send( action, success, failure );
	};
}


export default ModalDialogComponent.extend({
	layout: layout,
	"class": "modal-confirm",


	actions: {
		"apply"  : actionFactory( "apply" ),
		"discard": actionFactory( "discard" ),
		"cancel" : actionFactory( "cancel" )
	}
});
