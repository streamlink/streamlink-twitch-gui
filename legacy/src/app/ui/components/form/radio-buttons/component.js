import { set } from "@ember/object";
import Selectable from "../-selectable/component";
import layout from "./template.hbs";
import "./styles.less";


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
