import { get } from "ember";
import InputBtnComponent from "components/form/InputBtnComponent";


export default InputBtnComponent.extend({
	classNames: [ "radio-btn-component" ],

	click() {
		if ( get( this, "disabled" ) ) { return; }
		// notify RadioBtnsComponent that the current RadioBtnComponent is the selection now
		get( this, "onClick" )( this );
	}
});
