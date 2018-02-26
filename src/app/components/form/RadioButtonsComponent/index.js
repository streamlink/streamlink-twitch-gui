import { set } from "@ember/object";
import Selectable from "../-selectable";
import layout from "templates/components/form/RadioButtonsComponent.hbs";


export default Selectable.extend({
	layout,

	tagName: "div",
	classNames: [ "radio-buttons-component" ],

	actions: {
		change( item ) {
			set( this, "selection", item );
		}
	}
});
