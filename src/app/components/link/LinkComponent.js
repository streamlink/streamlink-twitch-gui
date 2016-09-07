import {
	get,
	LinkComponent
} from "Ember";


// reopen and don't extend: this class may be used globally
export default LinkComponent.reopen({
	active: function() {
		var active = this._super.apply( this, arguments );
		if ( active === false ) {
			var inactiveClass = get( this, "inactiveClass" );
			return inactiveClass ? inactiveClass : false;
		}
		return active;
	}.property( "attrs.params", "_routing.currentState", "inactiveClass" ),

	/*
	 * Prevent new windows from being opened by middleclicking on links/anchors
	 */
	didInsertElement() {
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
	click( event ) {
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
