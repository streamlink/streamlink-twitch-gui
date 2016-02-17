define( [ "Ember" ], function( Ember ) {

	var setProperties = Ember.setProperties;
	var notEmpty = Ember.computed.notEmpty;

	var reModalName = /[A-Z]/g;

	function fnModalName( a ) {
		return "-" + a.toLowerCase();
	}


	return Ember.Service.extend({
		modal  : null,
		context: null,

		isModalOpened: notEmpty( "modal" ),


		openModal: function( modal, context, data ) {
			modal = "modal-" + modal.replace( reModalName, fnModalName );

			if ( context && data ) {
				setProperties( context, data );
			}

			setProperties( this, {
				modal  : modal,
				context: context || null
			});
		},

		closeModal: function() {
			setProperties( this, {
				modal  : null,
				context: null
			});
		}
	});

});
