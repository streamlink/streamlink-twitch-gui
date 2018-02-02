import {
	get,
	Component
} from "ember";
import IsFocusedMixin from "../mixins/is-focused";
import layout from "templates/components/form/InputBtnComponent.hbs";


export default Component.extend( IsFocusedMixin, {
	layout,

	tagName: "label",
	classNames: [ "input-btn-component" ],
	classNameBindings: [ "checked", "disabled" ],
	attributeBindings: [ "tabindex" ],
	tabindex: 0,


	keyDown( event ) {
		event = event.originalEvent || event;
		switch ( event.code ) {
			case "Escape":
				if ( this._isFocused() ) {
					this.$().blur();
					return false;
				}
				return;

			case "Space":
				if ( this._isFocused() && !get( this, "disabled" ) ) {
					this.click();
					return false;
				}
				return;
		}
	}

}).reopenClass({
	positionalParams: [ "label" ]
});
