import Component from "@ember/component";
import isFocused from "utils/is-focused";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	layout,

	tagName: "label",
	classNames: [ "input-btn-component" ],
	classNameBindings: [ "checked", "disabled" ],
	attributeBindings: [ "tabindex" ],
	tabindex: 0,


	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		switch ( event.key ) {
			case "Escape":
				if ( isFocused( this.element ) ) {
					this.$().blur();
					return false;
				}
				return;

			case " ":
				if ( isFocused( this.element ) && !this.disabled ) {
					this.click();
					return false;
				}
				return;
		}
	}

}).reopenClass({
	positionalParams: [ "label" ]
});
