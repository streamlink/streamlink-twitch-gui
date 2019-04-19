import { set, action } from "@ember/object";
import { attribute, className, classNames, layout, tagName } from "@ember-decorators/component";
import SelectableComponent from "../-selectable/component";
import isFocused from "utils/is-focused";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "div" )
@classNames( "drop-down-component" )
export default class DropDownComponent extends SelectableComponent {
	@className
	class = "";
	@className
	disabled = false;

	@attribute
	tabindex = 0;

	expanded = false;

	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		switch ( event.key ) {
			case "Escape":
			case "Backspace":
				if ( this.expanded ) {
					set( this, "expanded", false );
					return false;
				}
				if ( isFocused( this.element ) ) {
					this.element.blur();
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
	}

	_switchSelectionOnArrowKey( change ) {
		if ( !this.expanded || !isFocused( this.element ) ) {
			return;
		}

		const content = this.content;
		const selIndex = content.indexOf( this.selection );
		if ( selIndex === -1 ) {
			return;
		}

		const newIndex = ( selIndex + change + content.length ) % content.length;
		const newSelection = content[ newIndex ];
		set( this, "selection", newSelection );

		return false;
	}


	@action
	toggle() {
		if ( this.disabled ) {
			set( this, "expanded", false );
		} else {
			this.toggleProperty( "expanded" );
		}
	}
}
