define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: [ "application" ],

		Button: function( value, button, icon, action ) {
			this.value	= value;
			this.button	= button;
			this.icon	= icon;
			this.action	= action;
		},

		head: null,
		body: null,
		buttons: [],

		actions: {
			close: function( action ) {
				if ( action ) { action(); }
				return this.send( "closeModal" );
			}
		}
	});

});
