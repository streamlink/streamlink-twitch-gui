import Component from "@ember/component";
import { set, computed } from "@ember/object";
import { or } from "@ember/object/computed";
import { scheduleOnce } from "@ember/runloop";
import isFocused from "utils/is-focused";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	layout,

	tagName: "label",
	classNames: [ "input-btn-component" ],
	classNameBindings: [ "checked", "disabled", "_blockOrLabel::no-label" ],
	attributeBindings: [ "tabindex", "title" ],
	tabindex: 0,

	_blockOrLabel: or( "hasBlock", "label" ),

	/**
	 * Super dirty hack!!!
	 * hasBlock is only available as a keyword in the template
	 * however, we need to know whether the component was invoked with a block or not
	 * use this computed property which (lazily) sets a (different) hasBlock property here
	 * this computed property will be called in the template's hasBlock block
	 */
	_setHasBlock: computed(function() {
		scheduleOnce( "afterRender", () => {
			set( this, "hasBlock", true );
		});
	}),

	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		switch ( event.key ) {
			case "Escape":
				if ( isFocused( this.element ) ) {
					this.element.blur();
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
	positionalParams: [ "label", "description" ]
});
