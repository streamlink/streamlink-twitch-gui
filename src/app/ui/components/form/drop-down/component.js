import { get, set } from "@ember/object";
import Selectable from "../-selectable/component";
import IsFocusedMixin from "ui/components/-mixins/is-focused";
import layout from "./template.hbs";
import "./styles.less";


export default Selectable.extend( IsFocusedMixin, {
	layout,

	tagName: "div",
	classNames: [ "drop-down-component" ],
	classNameBindings: [
		"disabled:disabled",
		"class"
	],
	attributeBindings: [ "tabindex" ],
	tabindex: 0,

	disabled: false,
	expanded: false,


	keyDown( event ) {
		event = event.originalEvent || event;
		switch ( event.code ) {
			case "Escape":
			case "Backspace":
				if ( get( this, "expanded" ) ) {
					set( this, "expanded", false );
					return false;
				}
				if ( this._isFocused() ) {
					this.$().blur();
					return false;
				}
				return;

			case "Space":
				if ( this._isFocused() ) {
					this.send( "toggle" );
					return false;
				}
				return;

			case "ArrowUp":
				return this._switchSelectionOnArrowKey( -1 );

			case "ArrowDown":
				return this._switchSelectionOnArrowKey( 1 );
		}
	},

	_switchSelectionOnArrowKey( change ) {
		if ( !get( this, "expanded" ) || !this._isFocused() ) {
			return;
		}

		const content = get( this, "content" );
		const selection = get( this, "selection" );
		const selIndex = content.indexOf( selection );
		if ( selIndex === -1 ) {
			return;
		}

		const newIndex = ( selIndex + change + content.length ) % content.length;
		const newSelection = content[ newIndex ];
		set( this, "selection", newSelection );

		return false;
	},


	actions: {
		toggle() {
			if ( get( this, "disabled" ) ) {
				set( this, "expanded", false );
			} else {
				this.toggleProperty( "expanded" );
			}
		}
	}
});
