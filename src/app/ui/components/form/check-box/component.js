import { get } from "@ember/object";
import InputBtnComponent from "../-input-btn/component";


export default InputBtnComponent.extend({
	classNames: [ "check-box-component" ],

	click() {
		if ( get( this, "disabled" ) ) { return; }
		this.toggleProperty( "checked" );
	}
});
