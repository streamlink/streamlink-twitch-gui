define( [ "ember", "gui/selecter" ], function( Ember, guiSelecter ) {

	// reopen and don't extend: this class may be used globally

	return Ember.Select.reopen({
		classNameBindings: [ "myclass" ],

		didInsertElement: function() {
			this._super();
			guiSelecter( this.$() );
		},

		/*
		 * Surprisingly, there is no change event when changing the value/selection properties.
		 * Selecter also doesn't observe the this.element.value property, so we need to trigger a
		 * custom change event in case it changed without a user interaction (click, etc),
		 * so Selecter can properly do the DOM manipulations...
		 * We're observing the "selection" property, so the event will only trigger once
		 * (observing the "value" property will cause the event to trigger twice)
		 */
		_mySelectionChangedObserver: function() {
			var e = document.createEvent( "HTMLEvents" );
			e.initEvent( "change", false, true );
			this.element.dispatchEvent( e );
		}.observes( "selection" )
	});

});
