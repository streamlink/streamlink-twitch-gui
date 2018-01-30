import {
	get,
	Component
} from "ember";
import layout from "templates/components/form/DropDownComponent/selection.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "drop-down-selection-component" ],
	classNameBindings: [ "class" ],

	placeholder: "Please choose",

	click() {
		get( this, "action" )();
		return false;
	}
});
