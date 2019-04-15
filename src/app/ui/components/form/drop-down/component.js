import { get, set } from "@ember/object";
import Selectable from "../-selectable/component";
import isFocused from "utils/is-focused";
import layout from "./template.hbs";
import "./styles.less";


export default Selectable.extend({
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


	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		switch ( event.key ) {
			case "Escape":
			case "Backspace":
				if ( get( this, "expanded" ) ) {
					set( this, "expanded", false );
					return false;
				}
				if ( isFocused( this.element ) ) {
					this.$().blur();
					return false;
				}
				return;

			case " ":
				if ( isFocused( this.element ) ) {
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
		if ( !get( this, "expanded" ) || !isFocused( this.element ) ) {
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
