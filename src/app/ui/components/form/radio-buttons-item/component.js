import { get } from "@ember/object";
import InputBtnComponent from "../-input-btn/component";


export default InputBtnComponent.extend({
	classNames: [ "radio-buttons-item-component" ],

	click() {
		if ( get( this, "disabled" ) ) { return; }
		get( this, "action" )();
	}
});
