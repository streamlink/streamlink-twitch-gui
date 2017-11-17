import {
	get,
	Component
} from "ember";
import HotkeyMixin from "../mixins/hotkey";
import layout from "templates/components/form/InputBtnComponent.hbs";


export default Component.extend( HotkeyMixin, {
	layout,

	tagName: "label",
	classNames: [ "input-btn-component" ],
	classNameBindings: [ "checked", "disabled" ],
	attributeBindings: [ "tabindex" ],

	tabindex: 0,

	hotkeys: [
		{
			code: "Escape",
			action() {
				if ( !this.isFocused() ) {
					return true;
				}
				this.$().blur();
			}
		},
		{
			code: "Space",
			action() {
				if ( !this.isFocused() || get( this, "disabled" ) ) {
					return true;
				}
				this.click();
			}
		}
	]

}).reopenClass({
	positionalParams: [ "label" ]
});
