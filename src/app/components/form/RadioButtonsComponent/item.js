import { get } from "ember";
import InputBtnComponent from "../InputBtnComponent";


export default InputBtnComponent.extend({
	classNames: [ "radio-buttons-item-component" ],

	click( item ) {
		if ( get( this, "disabled" ) ) { return; }
		get( this, "action" )( item );
	}
});
