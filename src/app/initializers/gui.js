/*
 * No real ApplicationInitializer
 * We just apply some changes to Ember classes and the GUI here...
 */
define([
	"ember",
	"views/ApplicationView",
	"gui/selectable",
	"gui/smoothscroll",
	"gui/selecter"
], function( Ember, ApplicationView, GUISelectable, GUISmoothscroll, GUISelecter ) {

	ApplicationView.reopen({
		didInsertElement: function() {
			this._super();
			GUISelectable();
			GUISmoothscroll();
		}
	});


	Ember.LinkView.reopen({
		/*
		 * Prevent new windows from being opened by middleclicking on links/anchors
		 */
		didInsertElement: function() {
			this._super();
			this.$().on( "click", function( e ) {
				if ( e.button !== 0 ) {
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			});
		},

		/*
		 * Enable route refreshing by clicking on the link pointing to this route
		 */
		click: function( event ) {
			if ( this.get( "active" ) ) {
				var controller = this.get( "controller.targetObject" );
				if ( controller ) {
					event.preventDefault();
					event.stopImmediatePropagation();
					controller.send( "refresh" );
				}
			} else {
				this._super.apply( this, arguments );
			}
		}
	});


	Ember.Select.reopen({
		didInsertElement: function() {
			this._super();
			GUISelecter( this.$() );
		}
	});

});
