import { get } from "@ember/object";
import InputBtnComponent from "../InputBtnComponent";


export default InputBtnComponent.extend({
	classNames: [ "radio-buttons-item-component" ],

	click() {
		if ( get( this, "disabled" ) ) { return; }
		get( this, "action" )();
	}
});
