import {
	get,
	computed,
	LinkComponent
} from "Ember";


// reopen and don't extend: this class may be used globally
export default LinkComponent.reopen({
	active: computed( "attrs.params", "_routing.currentState", "inactiveClass", function() {
		let active = this._super( ...arguments );
		if ( active === false ) {
			let inactiveClass = get( this, "inactiveClass" );
			return inactiveClass ? inactiveClass : false;
		}
		return active;
	}),

	/*
	 * Prevent new windows from being opened by middleclicking on links/anchors
	 */
	didInsertElement() {
		this._super( ...arguments );
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
			// FIXME: targetObject
			let targetObject = get( this, "_targetObject" );
			if ( targetObject ) {
				event.preventDefault();
				event.stopImmediatePropagation();
				targetObject.send( "refresh" );
			}
		} else {
			this._super( ...arguments );
		}
	}
});
