define([
	"Ember",
	"components/modal/ModalDialogComponent",
	"nwjs/nwWindow",
	"templates/components/modal/ModalQuitComponent.hbs"
], function(
	Ember,
	ModalDialogComponent,
	nwWindow,
	layout
) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;


	return ModalDialogComponent.extend({
		livestreamer: Ember.inject.service(),

		layout: layout,
		"class": "modal-quit",

		hasStreams: readOnly( "livestreamer.model.length" ),


		actions: {
			"shutdown": function() {
				get( this, "livestreamer" ).killAll();
				this.send( "quit" );
			},

			"quit": function() {
				nwWindow.close( true );
			}
		}
	});

});
