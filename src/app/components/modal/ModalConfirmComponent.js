define([
	"Ember",
	"components/modal/ModalDialogComponent",
	"templates/components/modal/ModalConfirmComponent.hbs"
], function(
	Ember,
	ModalDialogComponent,
	layout
) {

	var get = Ember.get;

	function actionFactory( action ) {
		return function( success, failure ) {
			get( this, "modal.context" ).send( action, success, failure );
		};
	}


	return ModalDialogComponent.extend({
		layout: layout,
		"class": "modal-confirm",


		actions: {
			"apply"  : actionFactory( "apply" ),
			"discard": actionFactory( "discard" ),
			"cancel" : actionFactory( "cancel" )
		}
	});

});
