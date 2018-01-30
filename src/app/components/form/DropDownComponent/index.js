import {
	get,
	set
} from "ember";
import Selectable from "../-selectable";
import HotkeyMixin from "../../mixins/hotkey";
import layout from "templates/components/form/DropDownComponent/index.hbs";


function switchSelectionOnArrowKey( change ) {
	return function() {
		if ( !get( this, "expanded" ) || !this.isFocused() ) {
			return true;
		}

		const content = get( this, "content" );
		const selection = get( this, "selection" );
		const selIndex = content.indexOf( selection );
		if ( selIndex === -1 ) {
			return true;
		}

		const newIndex = ( selIndex + change + content.length ) % content.length;
		const newSelection = content[ newIndex ];
		set( this, "selection", newSelection );
	};
}


export default Selectable.extend( HotkeyMixin, {
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


	hotkeys: [
		{
			code: [ "Escape", "Backspace" ],
			action() {
				if ( get( this, "expanded" ) ) {
					set( this, "expanded", false );
					return false;
				}
				if ( this.isFocused() ) {
					this.$().blur();
					return false;
				}
				// let the event bubble up
				return true;
			}
		},
		{
			code: "Space",
			action() {
				if ( !this.isFocused() ) {
					return true;
				}
				this.send( "toggle" );
			}
		},
		{
			code: "ArrowUp",
			action: switchSelectionOnArrowKey( -1 )
		},
		{
			code: "ArrowDown",
			action: switchSelectionOnArrowKey( +1 )
		}
	],


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
