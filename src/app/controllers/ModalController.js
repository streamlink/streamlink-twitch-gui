define( [ "ember" ], function( Ember ) {

	function ModalButton( value, classname, icon, action ) {
		this.isButton	= true;
		this.value		= value;
		this.action		= action;
		this.classname	= classname;
		this.icon		= icon;
	}

	function ModalSelect( list, value, classname, action ) {
		this.isSelect	= true;
		this.list		= list;
		this.value		= value;
		this.classname	= classname;
		this.action		= action;
	}

	return Ember.ObjectController.extend({
		needs: [ "application" ],

		Button: ModalButton,
		Select: ModalSelect,

		head: null,
		body: null,
		controls: [],

		actions: {
			"button": function( action ) {
				if ( !action || action && action() !== false ) {
					this.send( "closeModal" );
				}
			}
		}
	});

});
