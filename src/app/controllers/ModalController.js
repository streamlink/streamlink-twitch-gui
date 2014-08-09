define( [ "ember" ], function( Ember ) {

	function ModalButton( value, classname, icon, action ) {
		this.isButton	= true;
		this.value		= value;
		this.action		= action;
		this.classname	= classname;
		this.icon		= icon;
	}

	function ModalButtonClose( action ) {
		ModalButton.call( this, "Close", "btn-danger", "fa-times", action );
	}

	function ModalButtonBrowser( value, icon, url, action ) {
		ModalButton.call( this, value, "btn-success", icon, action );
		this.url = url;
	}

	function ModalButtonDownload( url, action ) {
		ModalButtonBrowser.call( this, "Download", "fa-download", url, action );
	}
	ModalButtonDownload.prototype = new ModalButtonBrowser();

	function ModalSelect( list, value, classname, action ) {
		this.isSelect	= true;
		this.list		= list;
		this.value		= value;
		this.classname	= classname;
		this.action		= function() {
			return action.apply( this, [].slice.call( arguments ).concat( this.selection ) );
		};
	}

	return Ember.ObjectController.extend({
		needs: [ "application" ],

		Button: ModalButton,
		ButtonClose: ModalButtonClose,
		ButtonBrowser: ModalButtonBrowser,
		ButtonDownload: ModalButtonDownload,

		Select: ModalSelect,

		head: null,
		body: null,
		controls: [],

		actions: {
			"button": function( button, action ) {
				if ( button instanceof ModalButtonBrowser ) {
					this.send( "openBrowser", button.url );
				}

				if ( action !== false && !( action instanceof Function && action() === false ) ) {
					this.send( "closeModal" );
				}
			}
		}
	});

});
