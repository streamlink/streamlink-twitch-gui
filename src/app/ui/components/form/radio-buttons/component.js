import { set } from "@ember/object";
import Selectable from "../-selectable/component";
import layout from "./template.hbs";


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
