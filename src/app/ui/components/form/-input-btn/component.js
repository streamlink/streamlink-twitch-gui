import Component from "@ember/component";
import { set, computed } from "@ember/object";
import { or } from "@ember/object/computed";
import { scheduleOnce } from "@ember/runloop";
import { attribute, className, classNames, layout, tagName } from "@ember-decorators/component";
import isFocused from "utils/is-focused";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "label" )
@classNames( "input-btn-component" )
export default class InputBtnComponent extends Component {
	static positionalParams = [ "label" ];

	label;

	@attribute
	tabindex = 0;

	@attribute
	title;

	@className
	checked = false;

	@className
	disabled = false;

	@or( "hasBlock", "label" )
	@className( "", "no-label" )
	_blockOrLabel;

	/**
	 * Super dirty hack!!!
	 * hasBlock is only available as a keyword in the template
	 * however, we need to know whether the component was invoked with a block or not
	 * use this computed property which (lazily) sets a (different) hasBlock property here
	 * this computed property will be called in the template's hasBlock block
	 */
	@computed(function() {
		scheduleOnce( "afterRender", () => {
			set( this, "hasBlock", true );
		});
	})
	_setHasBlock;

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
}
