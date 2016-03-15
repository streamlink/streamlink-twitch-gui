define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
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

		closeModal: function( context, force ) {
			var _context = get( this, "context" );
			if ( !force && _context !== null && context !== _context ) { return; }

			setProperties( this, {
				modal  : null,
				context: null
			});
		}
	});

});
