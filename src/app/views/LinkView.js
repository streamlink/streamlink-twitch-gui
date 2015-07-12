define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;

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
			if ( get( this, "active" ) ) {
				var targetObject = get( this, "controller.targetObject" );
				if ( targetObject ) {
					event.preventDefault();
					event.stopImmediatePropagation();
					targetObject.send( "refresh" );
				}
			} else {
				this._super.apply( this, arguments );
			}
		}
	});

});
