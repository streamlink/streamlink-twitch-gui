define( [ "Ember" ], function( Ember ) {

	// reopen and don't extend: this class may be used globally

	return Ember.LinkView.reopen({
		/*
		 * Prevent new windows from being opened by middleclicking on links/anchors
		 */
		didInsertElement: function() {
			this._super();
			this.$().on( "click", function( e ) {
				if ( e.button !== 0 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) {
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

});
