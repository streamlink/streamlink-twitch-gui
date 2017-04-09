import { get } from "ember";
import InputBtnComponent from "components/form/InputBtnComponent";


export default InputBtnComponent.extend({
	classNames: [ "check-box-component" ],

	click() {
		if ( get( this, "disabled" ) ) { return; }
		this.toggleProperty( "checked" );
	}
});
